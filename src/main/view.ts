import type { WebContents, WebPreferences } from "electron";
import { app, BrowserView, ipcMain } from "electron";
import { windowInstance } from "./window";
import { getMachineGuid } from "./machine";
import { logError } from "./log";

/**
 * 窗口打开预处理
 */
function viewOpenHandler(webContents: WebContents) {
  webContents.setWindowOpenHandler(({ url }) => {
    webContents.loadURL(url);
    return { action: "deny" };
  });
}

export interface ViewOpt {
  key: string;
  winId: number;
  owh: [number, number];
  webPreferences: WebPreferences;
  url: string;
  data: any;
}

export interface ViewItem {
  isAlone: boolean;
  isResize?: boolean;
  winId: number; // view所挂载的窗体
  owh: [number, number]; // view所在窗口宽高偏移量
  bv: BrowserView; // view主体
}

export class View {
  public views: {
    [key: string]: ViewItem;
  } = {};

  constructor() {}

  setBounds(winWh: number[], view: ViewItem) {
    view.bv.setBounds({
      x: view.owh[0],
      y: view.owh[1],
      width: winWh[0] - view.owh[0],
      height: winWh[1] - view.owh[1],
    });
  }

  setAutoResize(view: ViewItem) {
    view.bv.setAutoResize({
      horizontal: true,
      vertical: true,
    });
  }

  hideAll(winId?: number) {
    const is = winId !== undefined && winId !== null;
    for (const key in this.views) {
      const view = this.views[key];
      is && view.winId === winId && this.hide(key);
      !is && this.hide(key);
    }
  }

  hide(key: string) {
    if (!this.views[key]) {
      throw new Error("[view hide] not view");
    }
    const win = windowInstance.get(this.views[key].winId);
    if (!win) {
      throw new Error("[view hide] not win");
    }
    this.views[key].isResize = false;
    win.removeBrowserView(this.views[key].bv);
  }

  show(key: string) {
    if (!this.views[key]) {
      throw new Error("[view show] not view");
    }
    const win = windowInstance.get(this.views[key].winId);
    if (!win) {
      throw new Error("[view show] not win");
    }
    win.show();
    const winBz = win.getBounds();
    this.views[key].isResize = true;
    win.setBrowserView(this.views[key].bv);
    this.setBounds([winBz.width, winBz.height], this.views[key]);
  }

  stop(key: string) {
    if (!this.views[key]) {
      throw new Error("[view stop] not view");
    }
    return this.views[key].bv.webContents.stop();
  }

  reload(key: string) {
    if (!this.views[key]) {
      throw new Error("[view reload] not view");
    }
    this.views[key].bv.webContents.reload();
  }

  canGoBack(key: string) {
    if (!this.views[key]) {
      throw new Error("[view canGoBack] not view");
    }
    return this.views[key].bv.webContents.canGoBack();
  }

  goBack(key: string) {
    if (!this.views[key]) {
      throw new Error("[view goBack] not view");
    }
    this.views[key].bv.webContents.goBack();
  }

  canGoForward(key: string) {
    if (!this.views[key]) {
      throw new Error("[view canGoForward] not view");
    }
    return this.views[key].bv.webContents.canGoForward();
  }

  goForward(key: string) {
    if (!this.views[key]) {
      throw new Error("[view goForward] not view");
    }
    this.views[key].bv.webContents.goForward();
  }

  removeAll(winId?: number) {
    const is = winId !== undefined && winId !== null;
    for (const key in this.views) {
      const view = this.views[key];
      is && view.winId === winId && this.remove(key);
      !is && this.remove(key);
    }
  }

  openDevTools(key: string) {
    if (!this.views[key]) {
      throw new Error("[view goForward] not view");
    }
    this.views[key].bv.webContents.openDevTools({ mode: "detach" });
  }

  remove(key: string) {
    if (!this.views[key]) {
      throw new Error("[view remove] not view");
    }
    const win = windowInstance.get(this.views[key].winId);
    if (!win) {
      throw new Error("[view remove] not win");
    }
    win.removeBrowserView(this.views[key].bv);
    this.views[key].isAlone && win.close();
    // @ts-ignore
    this.views[key].bv.webContents.destroy();
    delete this.views[key];
  }

  async alone(key: string, winId: number, owh: [number, number] = [0, 0]) {
    if (!this.views[key]) {
      throw new Error("[view alone] not view");
    }
    const oldWin = windowInstance.get(this.views[key].winId);
    if (!oldWin) {
      throw new Error("[view alone] not oldWin");
    }
    const newWin = windowInstance.get(winId);
    if (!newWin) {
      throw new Error("[view alone] not newWin");
    }
    oldWin.removeBrowserView(this.views[key].bv);
    const newWinBz = newWin.getBounds();
    this.views[key].isAlone = true;
    this.views[key].isResize = true;
    this.views[key].winId = winId;
    this.views[key].owh = owh;
    this.views[key].bv.webContents.removeAllListeners("page-title-updated");
    this.views[key].bv.webContents.removeAllListeners("did-navigate");
    this.views[key].bv.webContents.removeAllListeners("did-navigate-in-page");
    this.views[key].bv.webContents.on("page-title-updated", (_, title) => {
      newWin.webContents.send("view-title-update", { key, title });
    });
    this.views[key].bv.webContents.on("did-navigate", () => {
      newWin.webContents.send("view-page-update", {
        key,
        canGoBack: this.views[key].bv.webContents.canGoBack(),
        canGoForward: this.views[key].bv.webContents.canGoForward(),
      });
    });
    this.views[key].bv.webContents.on("did-navigate-in-page", () => {
      newWin.webContents.send("view-page-update", {
        key,
        canGoBack: this.views[key].bv.webContents.canGoBack(),
        canGoForward: this.views[key].bv.webContents.canGoForward(),
      });
    });
    this.views[key].bv.webContents.send("view-alone-open");
    newWin.setBrowserView(this.views[key].bv);
    this.setBounds([newWinBz.width, newWinBz.height], this.views[key]);
    this.setAutoResize(this.views[key]);
    return this.views[key].bv.webContents.id;
  }

  async create(opt: ViewOpt, isAlone: boolean = false) {
    if (!opt) {
      throw new Error("[view create] not ViewOpt");
    }
    if (this.views[opt.key]) {
      opt.winId === this.views[opt.key].winId && this.show(opt.key);
      return;
    }
    const win = windowInstance.get(opt.winId);
    if (!win) {
      throw new Error("[view create] not win");
    }
    const winBz = win.getBounds();
    opt.webPreferences = Object.assign(
      {
        preload: windowInstance.defaultPreload,
        contextIsolation: true,
        nodeIntegration: false,
        devTools: true,
        webSecurity: false,
      },
      opt.webPreferences
    );
    // @ts-ignore
    this.views[opt.key] = {
      winId: opt.winId,
      owh: opt.owh,
      isResize: true,
      isAlone,
    };
    this.views[opt.key].bv = new BrowserView({
      webPreferences: opt.webPreferences,
    });
    viewOpenHandler(this.views[opt.key].bv.webContents);
    // 调试打开F12
    !app.isPackaged &&
      this.views[opt.key].bv.webContents.openDevTools({ mode: "detach" });
    this.views[opt.key].bv.webContents.on("page-title-updated", (_, title) => {
      win.webContents.send("view-title-update", { key: opt.key, title });
    });
    this.views[opt.key].bv.webContents.on("did-navigate", () => {
      win.webContents.send("view-page-update", {
        key: opt.key,
        canGoBack: this.views[opt.key].bv.webContents.canGoBack(),
        canGoForward: this.views[opt.key].bv.webContents.canGoForward(),
      });
    });
    this.views[opt.key].bv.webContents.on("did-navigate-in-page", () => {
      win.webContents.send("view-page-update", {
        key: opt.key,
        canGoBack: this.views[opt.key].bv.webContents.canGoBack(),
        canGoForward: this.views[opt.key].bv.webContents.canGoForward(),
      });
    });
    // 初次参数
    this.views[opt.key].bv.webContents.on("did-finish-load", () =>
      this.views[opt.key].bv.webContents.send("window-load", {
        isAlone,
        isView: true,
        appVersion: app.getVersion(),
        appName: app.getName(),
        systemVersion: process.getSystemVersion(),
        platform: process.platform,
        machineGuid: getMachineGuid(),
        data: opt.data,
      })
    );
    // 放入win
    win.setBrowserView(this.views[opt.key].bv);
    // 启动
    if (opt.url.startsWith("https://") || opt.url.startsWith("http://")) {
      await this.views[opt.key].bv.webContents.loadURL(opt.url).catch(logError);
    } else {
      await this.views[opt.key].bv.webContents
        .loadFile(opt.url)
        .catch(logError);
    }
    this.setBounds([winBz.width, winBz.height], this.views[opt.key]);
    this.setAutoResize(this.views[opt.key]);
    return this.views[opt.key].bv.webContents.id;
  }

  exist(key: string) {
    return !!this.views[key];
  }

  on() {
    ipcMain.handle("view-new", (event, args) =>
      this.create(args.opt, args.isAlone)
    );
    ipcMain.handle("view-exist", (event, args) => this.exist(args.key));
    ipcMain.handle("view-alone", (event, args) =>
      this.alone(args.key, args.winId, args.owh)
    );
    ipcMain.handle("view-hide", async (event, args) => this.hide(args.key));
    ipcMain.handle("view-show", async (event, args) => this.show(args.key));
    ipcMain.handle("view-stop", async (event, args) => this.stop(args.key));
    ipcMain.handle("view-reload", async (event, args) => this.reload(args.key));
    ipcMain.handle("view-open-dev-tools", async (event, args) =>
      this.openDevTools(args.key)
    );
    ipcMain.handle("view-can-go-back", async (event, args) =>
      this.canGoBack(args.key)
    );
    ipcMain.handle("view-go-back", async (event, args) =>
      this.goBack(args.key)
    );
    ipcMain.handle("view-can-go-forward", async (event, args) =>
      this.canGoForward(args.key)
    );
    ipcMain.handle("view-go-forward", async (event, args) =>
      this.goForward(args.key)
    );
    ipcMain.handle("view-remove", async (event, args) => this.remove(args.key));
    ipcMain.handle("view-hide-all", async (event, args) =>
      this.hideAll(args.winId)
    );
    ipcMain.handle("view-remove-all", async (event, args) =>
      this.removeAll(args.winId)
    );
  }
}
