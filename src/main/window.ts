import type {
  BrowserWindowConstructorOptions,
  LoadFileOptions,
  LoadURLOptions,
  WebContents
} from 'electron';
import type {
  Customize,
  Position,
  WindowAlwaysOnTopOpt,
  WindowFuncOpt,
  WindowStatusOpt
} from '../types/index';
import { WindowChannel } from '../types/channel';
import { endianness } from 'os';
import { app, screen, BrowserWindow, webContents } from 'electron';
import preload from '../preload';

declare global {
  interface Window {
    customize: Omit<Customize, 'winId' | 'webContentsId'> & {
      winId: number;
      webContentsId: number;
    };
  }

  module Electron {
    interface BrowserWindow {
      customize: Customize;
    }

    interface BrowserWindowConstructorOptions {
      customize?: Customize;
    }
  }
}

export interface LoadOptions {
  openDevTools?: boolean;
}

/**
 * 计算xy
 * @param win
 */
function countXy(win: BrowserWindow, bwOpt: BrowserWindowConstructorOptions, position?: Position) {
  const currentWH = win.getBounds();
  const currentPosition = win.getPosition();
  const displayWorkAreaSize = screen.getPrimaryDisplay().workAreaSize;
  switch (position) {
    case 'center':
      if (win.isMaximized()) {
        bwOpt.x = ((displayWorkAreaSize.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = ((displayWorkAreaSize.height - bwOpt.height!) / 2) | 0;
      } else {
        bwOpt.x = (currentPosition[0] + (currentWH.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = (currentPosition[1] + (currentWH.height - bwOpt.height!) / 2) | 0;
      }
      break;
    default:
      break;
  }
}

/**
 * 窗口配置
 * @param customize
 * @param bwOptions
 * @returns
 */
function browserWindowAssembly(
  customize: Customize,
  bwOptions: BrowserWindowConstructorOptions = {}
) {
  if (!customize) throw new Error('not customize');
  // darwin下modal会造成整个窗口关闭(?)
  if (process.platform === 'darwin') delete bwOptions.modal;
  customize.silenceFunc = customize.silenceFunc || false;
  customize.isPackaged = app.isPackaged;
  bwOptions.webPreferences = Object.assign(
    {
      preload: windowInstance.defaultPreload,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      webSecurity: false
    },
    bwOptions.webPreferences
  );
  let bwOpt: BrowserWindowConstructorOptions = Object.assign(
    {
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      minimizable: true,
      maximizable: true
    },
    bwOptions
  );
  let countWin;
  if (customize.parentId) {
    countWin = windowInstance.get(customize.parentId as number);
    if (countWin) bwOpt.parent = countWin;
  }
  if (customize.position && !countWin) {
    countWin = windowInstance.getMain();
  }
  countWin && countXy(countWin, bwOpt, customize.position);
  return bwOpt;
}

/**
 * 窗口打开预处理
 */
function windowOpenHandler(webContents: WebContents, parentId?: number) {
  webContents.setWindowOpenHandler(({ url }) => {
    const win = windowInstance.create({
      url,
      parentId
    });
    win && windowInstance.load(win);
    return { action: 'deny' };
  });
}

function readBufferByOS(buf: Buffer) {
  return endianness() == 'LE' ? buf.readInt32LE() : buf.readInt32BE();
}

export interface WindowDefaultCfg {
  /**
   * 默认html加载方式
   */
  defaultLoadType: 'file' | 'url';

  /**
   * 默认html加载路径
   */
  defaultUrl: string;

  /**
   * 默认Preload加载路径
   */
  defaultPreload: string;
}

export class Window {
  private static instance: Window;

  /**
   * 默认html加载方式
   */
  defaultLoadType?: 'file' | 'url';

  /**
   * 默认html加载路径
   */
  defaultUrl?: string;

  /**
   * 默认Preload加载路径
   */
  defaultPreload?: string;

  /**
   * 创建拦截器
   */
  public interceptor:
    | undefined
    | ((
        opt: Electron.BrowserWindowConstructorOptions
      ) => Electron.BrowserWindowConstructorOptions) = undefined;

  static getInstance() {
    if (!Window.instance) Window.instance = new Window();
    return Window.instance;
  }

  constructor() {}

  setDefaultCfg(cfg: WindowDefaultCfg) {
    cfg.defaultLoadType && (this.defaultLoadType = cfg.defaultLoadType);
    cfg.defaultUrl && (this.defaultUrl = cfg.defaultUrl);
    cfg.defaultPreload && (this.defaultPreload = cfg.defaultPreload);
  }

  /**
   * 获取窗口
   * @param id 窗口id
   * @constructor
   */
  get(id: number) {
    return BrowserWindow.fromId(id);
  }

  /**
   * 获取全部窗口
   */
  getAll() {
    return BrowserWindow.getAllWindows();
  }

  /**
   * 获取主窗口(无主窗口获取后存在窗口)
   */
  getMain() {
    const all = this.getAll().reverse();
    let win: BrowserWindow | null = null;
    for (let index = 0; index < all.length; index++) {
      const item = all[index];
      if (index === 0) win = item;
      if (item?.customize?.isMainWin) {
        win = item;
        break;
      }
    }
    return win;
  }

  /**
   * 获取窗口hwnd
   * @param id
   * @returns
   */
  getHWnd(id?: number) {
    let win;
    id ? (win = this.get(id)) : (win = this.getMain());
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    return readBufferByOS(win.getNativeWindowHandle());
  }

  /**
   * 创建并加载窗口
   */
  async new(
    customize: Customize,
    bwOptions: BrowserWindowConstructorOptions = {},
    loadOptions?: LoadOptions
  ) {
    const newWin = this.create(customize, bwOptions);
    if (newWin) {
      await this.load(newWin, loadOptions);
      return newWin;
    }
    return null;
  }

  /**
   * 创建窗口
   * */
  create(customize: Customize, bwOptions: BrowserWindowConstructorOptions = {}) {
    if (customize.isOneWindow && !customize.url) {
      for (const i of this.getAll()) {
        if (customize?.route && customize.route === i.customize?.route) {
          i.webContents.send('window-single-data', customize?.data);
          return;
        }
      }
    }
    let bwOpt = browserWindowAssembly(customize, bwOptions);
    this.interceptor && (bwOpt = this.interceptor(bwOpt));
    const win = new BrowserWindow(bwOpt);
    // win32 取消原生窗口右键事件
    process.platform === 'win32' &&
      win.hookWindowMessage(278, () => {
        win.setEnabled(false);
        win.setEnabled(true);
      });
    // 子窗体关闭父窗体获焦 https://github.com/electron/electron/issues/10616
    bwOpt.parent && win.once('close', () => bwOpt.parent?.focus());
    // 参数设置
    !customize.argv && (customize.argv = process.argv);
    win.customize = customize;
    // 设置默认地址加载模式
    if (!win.customize.loadType) {
      win.customize.loadType = this.defaultLoadType;
    }
    // 设置默认地址
    if (!win.customize.url) {
      win.customize.url = this.defaultUrl;
    }
    return win;
  }

  /**
   * 窗口加载
   */
  load(win: BrowserWindow, loadOptions?: LoadOptions) {
    if (!win.customize.loadType) {
      throw new Error('[load] not loadType');
    }
    if (!win.customize.url) {
      throw new Error('[load] not url');
    }
    // 开启DevTools
    if (loadOptions && loadOptions.openDevTools) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
    // 窗口内创建拦截
    windowOpenHandler(win.webContents);
    // 窗口usb插拔消息监听
    process.platform === 'win32' &&
      win.hookWindowMessage(0x0219, (wParam, lParam) =>
        win.webContents.send('window-hook-message', wParam, lParam)
      );
    win.webContents.on('did-attach-webview', (_, webContents) =>
      windowOpenHandler(webContents, win.id)
    );
    // 窗口最大最小监听
    win.on('maximize', () => win.webContents.send('window-maximize-status', 'maximize'));
    win.on('unmaximize', () => win.webContents.send('window-maximize-status', 'unmaximize'));
    // 聚焦失焦监听
    win.on('blur', () => win.webContents.send('window-blur-focus', 'blur'));
    win.on('focus', () => win.webContents.send('window-blur-focus', 'focus'));
    switch (win.customize.loadType) {
      case 'file':
        return win.loadFile(win.customize.url, win.customize.loadOptions as LoadFileOptions);
      case 'url':
      default:
        return win.loadURL(win.customize.url, win.customize.loadOptions as LoadURLOptions);
    }
  }

  /**
   * 窗口关闭、隐藏、显示等常用方法（如果不传id则获取主窗口）
   */
  func(type: WindowFuncOpt, id?: number, data?: any[]) {
    let win: BrowserWindow | null = null;
    if (id !== null && id !== undefined) {
      win = this.get(id);
    } else {
      win = this.getMain();
    }
    if (!win) {
      console.error(`not found win -> ${id}`);
      return;
    }
    // @ts-ignore
    data ? win[type](...data) : win[type]();
    return;
  }

  /**
   * 窗口发送消息
   */
  send(key: string, value: any, id?: number) {
    if (id !== null && id !== undefined) {
      const win = this.get(id as number);
      if (win) win.webContents.send(key, value);
    } else for (const i of this.getAll()) i.webContents.send(key, value);
  }

  /**
   * 窗口发送消息
   */
  sendByWebContents(key: string, value: any, id?: number) {
    if (id !== null && id !== undefined) {
      const webContent = webContents.fromId(id);
      if (webContent) webContent.send(key, value);
    } else for (const webContent of webContents.getAllWebContents()) webContent.send(key, value);
  }

  /**
   * 窗口状态
   */
  getStatus(type: WindowStatusOpt, id: number) {
    const win = this.get(id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    return win[type]();
  }

  /**
   * 设置窗口最小大小
   */
  setMinSize(args: { id: number; size: number[] }) {
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    win.setMinimumSize(args.size[0], args.size[1]);
  }

  /**
   * 设置窗口最大大小
   */
  setMaxSize(args: { id: number; size: number[] }) {
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    const workAreaSize = args.size[0]
      ? { width: args.size[0], height: args.size[1] }
      : screen.getPrimaryDisplay().workAreaSize;
    win.setMaximumSize(workAreaSize.width, workAreaSize.height);
  }

  /**
   * 设置窗口大小
   */
  setSize(args: { id: number; size: number[]; resizable: boolean; center: boolean }) {
    let Rectangle: { [key: string]: number } = {
      width: args.size[0] | 0,
      height: args.size[1] | 0
    };
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    const winBounds = win.getBounds();
    if (Rectangle.width === winBounds.width && Rectangle.height === winBounds.height) return;
    if (!args.center) {
      const winPosition = win.getPosition();
      Rectangle.x = (winPosition[0] + (winBounds.width - args.size[0]) / 2) | 0;
      Rectangle.y = (winPosition[1] + (winBounds.height - args.size[1]) / 2) | 0;
    }
    win.once('resize', () => {
      if (args.center) win.center();
    });
    win.setResizable(args.resizable);
    win.setMinimumSize(Rectangle.width, Rectangle.height);
    win.setBounds(Rectangle);
  }

  /**
   * 设置窗口背景色
   */
  setBackgroundColor(args: { id: number; color: string }) {
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    win.setBackgroundColor(args.color);
  }

  /**
   * 设置窗口是否置顶
   */
  setAlwaysOnTop(args: { id: number; is: boolean; type?: WindowAlwaysOnTopOpt }) {
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    win.setAlwaysOnTop(args.is, args.type || 'normal');
  }

  /**
   * 开启监听
   */
  on() {
    // 窗口数据更新
    preload.handle(WindowChannel.update, ({ args }) => {
      if (args?.id) {
        const win = this.get(args.id);
        if (!win) {
          console.error('Invalid id, the id can not be a empty');
          return;
        }
        win.customize = args;
      }
    });
    // 最大化最小化窗口
    preload.handle<number>(WindowChannel.maxMinSize, ({ args }) => {
      if (args !== null && args !== undefined) {
        const win = this.get(args);
        if (!win) {
          console.error('Invalid id, the id can not be a empty');
          return;
        }
        if (win.isMaximized()) win.unmaximize();
        else win.maximize();
      }
    });
    // 窗口消息
    preload.handle(WindowChannel.func, ({ event, args }) =>
      this.func(args.type, args.id, args.data)
    );
    // 窗口状态
    preload.handle(WindowChannel.status, async ({ event, args }) =>
      this.getStatus(args.type, args.id)
    );
    // 创建窗口
    preload.handle(WindowChannel.new, async ({ event, args }) => {
      const newWin = await this.new(args.customize, args.windowOptions, args.loadOptions);
      if (newWin) {
        return {
          id: newWin.id,
          webContentsId: newWin.webContents.id
        };
      }
      return null;
    });
    // 窗口初始化加载
    preload.handle(WindowChannel.load, async ({ event }) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error('fromWebContents not');
      return {
        winId: win.id,
        webContentsId: win.webContents.id,
        ...win.customize
      };
    });
    // 设置窗口是否置顶
    preload.handle(WindowChannel.setAlwaysTop, ({ event, args }) => this.setAlwaysOnTop(args));
    // 设置窗口大小
    preload.handle(WindowChannel.setSize, ({ event, args }) => this.setSize(args));
    // 设置窗口(最小/最大)大小
    preload.handle(WindowChannel.setMinMaxSize, ({ event, args }) =>
      args.type === 'min' ? this.setMinSize(args) : this.setMaxSize(args)
    );
    // 设置窗口背景颜色
    preload.handle(WindowChannel.setBackgroundColor, ({ event, args }) =>
      this.setBackgroundColor(args)
    );
    // 窗口消息
    preload.handle(WindowChannel.sendMessage, ({ event, args }) => {
      const channel = `window-message-${args.channel}-back`;
      if (args.acceptIds && args.acceptIds.length > 0) {
        for (const i of args.acceptIds) this.send(channel, args.value, i);
        return;
      }
      for (const win of this.getAll()) {
        if (!args.isback && win.id === args.id) {
          win.webContents.send(channel, args.value);
        } else {
          win.webContents.send(channel, args.value);
        }
      }
    });
    preload.handle(WindowChannel.sendMessageContents, ({ event, args }) => {
      const channel = `window-message-contents-${args.channel}-back`;
      if (args.acceptIds && args.acceptIds.length > 0) {
        for (const i of args.acceptIds) {
          const webContent = webContents.fromId(i);
          webContent && webContent.send(channel, args.value);
        }
        return;
      }
      for (const webContent of webContents.getAllWebContents()) {
        if (!args.isback && webContent.id === args.id) {
          webContent.send(channel, args.value);
        } else {
          webContent.send(channel, args.value);
        }
      }
    });
    //通过路由获取窗口id (不传route查全部)
    preload.handle(WindowChannel.getWinId, async ({ event, args }) => {
      return this.getAll()
        .filter((win) => (args.route ? win.customize?.route === args.route : true))
        .map((win) => win.id);
    });
  }
}

export const windowInstance = Window.getInstance();
