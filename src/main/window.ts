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
} from '../types';
import { WindowChannel } from '../channel';
import { endianness } from 'os';
import { app, screen, BrowserWindow, webContents } from 'electron';
import { preload } from '../preload/main';

/**
 * 计算xy
 */
function countXy(
  bwOpt: BrowserWindowConstructorOptions,
  win: BrowserWindow,
  position?: Position,
  isParentPosition?: boolean,
  positionPadding: number = 0
) {
  isParentPosition ??= win.isMaximized();
  const currentWH = win.getBounds();
  const currentPosition = win.getPosition();
  const displayWorkAreaSize = screen.getPrimaryDisplay().workAreaSize;
  switch (position) {
    case 'left':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + positionPadding;
        bwOpt.y = (currentPosition[1] + (currentWH.height - bwOpt.height!) / 2) | 0;
      } else {
        bwOpt.x = positionPadding;
        bwOpt.y = ((displayWorkAreaSize.height - bwOpt.height!) / 2) | 0;
      }
      break;
    case 'left-top':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + positionPadding;
        bwOpt.y = currentPosition[1] + positionPadding;
      } else {
        bwOpt.x = positionPadding;
        bwOpt.y = positionPadding;
      }
      break;
    case 'left-bottom':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + positionPadding;
        bwOpt.y = currentPosition[1] + (currentWH.height - bwOpt.height!) - positionPadding;
      } else {
        bwOpt.x = positionPadding;
        bwOpt.y = displayWorkAreaSize.height - bwOpt.height! - positionPadding;
      }
      break;
    case 'center':
      if (isParentPosition) {
        bwOpt.x = (currentPosition[0] + (currentWH.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = (currentPosition[1] + (currentWH.height - bwOpt.height!) / 2) | 0;
      } else {
        bwOpt.x = ((displayWorkAreaSize.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = ((displayWorkAreaSize.height - bwOpt.height!) / 2) | 0;
      }
      break;
    case 'center-top':
      if (isParentPosition) {
        bwOpt.x = (currentPosition[0] + (currentWH.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = currentPosition[1] + positionPadding;
      } else {
        bwOpt.x = ((displayWorkAreaSize.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = positionPadding;
      }
      break;
    case 'center-bottom':
      if (isParentPosition) {
        bwOpt.x = (currentPosition[0] + (currentWH.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = currentPosition[1] + (currentWH.height - bwOpt.height!) - positionPadding;
      } else {
        bwOpt.x = ((displayWorkAreaSize.width - bwOpt.width!) / 2) | 0;
        bwOpt.y = displayWorkAreaSize.height - bwOpt.height! - positionPadding;
      }
      break;
    case 'right':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + (currentWH.width - bwOpt.width!) - positionPadding;
        bwOpt.y = (currentPosition[1] + (currentWH.height - bwOpt.height!) / 2) | 0;
      } else {
        bwOpt.x = displayWorkAreaSize.width - bwOpt.width! - positionPadding;
        bwOpt.y = ((displayWorkAreaSize.height - bwOpt.height!) / 2) | 0;
      }
      break;
    case 'right-top':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + (currentWH.width - bwOpt.width!) - positionPadding;
        bwOpt.y = currentPosition[1] + positionPadding;
      } else {
        bwOpt.x = displayWorkAreaSize.width - bwOpt.width! - positionPadding;
        bwOpt.y = positionPadding;
      }
      break;
    case 'right-bottom':
      if (isParentPosition) {
        bwOpt.x = currentPosition[0] + (currentWH.width - bwOpt.width!) - positionPadding;
        bwOpt.y = currentPosition[1] + (currentWH.height - bwOpt.height!) - positionPadding;
      } else {
        bwOpt.x = displayWorkAreaSize.width - bwOpt.width! - positionPadding;
        bwOpt.y = displayWorkAreaSize.height - bwOpt.height! - positionPadding;
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
  countWin &&
    countXy(
      bwOpt,
      countWin,
      customize.position,
      customize.isParentPosition,
      customize.positionPadding
    );
  return bwOpt;
}

/**
 * 窗口打开预处理
 */
function windowDefaultOpenHandler(webContents: WebContents, parentId?: number) {
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
  async new(customize: Customize, bwOptions: BrowserWindowConstructorOptions = {}) {
    const newWin = this.create(customize, bwOptions);
    newWin && (await this.load(newWin));
    return newWin;
  }

  /**
   * 创建窗口
   * */
  create(customize: Customize, bwOptions: BrowserWindowConstructorOptions = {}) {
    if (customize.isOneWindow && !customize.url) {
      for (const i of this.getAll()) {
        if (customize?.route && customize.route === i.customize?.route) {
          preload.send('window-single-data', customize?.data, [i.id]);
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
  load(
    win: BrowserWindow,
    openHandler?: (details: Electron.HandlerDetails) => Electron.WindowOpenHandlerResponse
  ) {
    if (!win.customize.loadType) {
      throw new Error('[load] not loadType');
    }
    if (!win.customize.url) {
      throw new Error('[load] not url');
    }
    // 窗口内创建拦截
    openHandler
      ? win.webContents.setWindowOpenHandler(openHandler)
      : windowDefaultOpenHandler(win.webContents);
    // 窗口usb插拔消息监听
    process.platform === 'win32' &&
      win.hookWindowMessage(0x0219, (wParam, lParam) =>
        preload.send('window-hook-message', { wParam, lParam }, [win.id])
      );
    // 窗口最大最小监听
    win.on('maximize', () => preload.send('window-maximize-status', 'maximize', [win.id]));
    win.on('unmaximize', () => preload.send('window-maximize-status', 'unmaximize', [win.id]));
    // 聚焦失焦监听
    win.on('blur', () => preload.send('window-blur-focus', 'blur', [win.id]));
    win.on('focus', () => preload.send('window-blur-focus', 'focus', [win.id]));
    switch (win.customize.loadType) {
      case 'file':
        return win.loadFile(win.customize.url, win.customize.loadOptions as LoadFileOptions);
      case 'url':
      default:
        return win.loadURL(win.customize.url, win.customize.loadOptions as LoadURLOptions);
    }
  }

  // 重新加载页面
  reload(win: BrowserWindow, loadType: Customize['loadType'], url: string) {
    win.customize.loadType = loadType;
    switch (loadType) {
      case 'file':
        win.customize.route = url;
        return app.isPackaged
          ? win.loadFile(this.defaultUrl!, win.customize.loadOptions as LoadFileOptions)
          : win.loadURL(this.defaultUrl!, win.customize.loadOptions as LoadURLOptions);
      case 'url':
        win.customize.url = url;
        return win.loadURL(url, win.customize.loadOptions as LoadURLOptions);
    }
  }

  /**
   * 窗口关闭、隐藏、显示等常用方法（如果不传id则获取主窗口）
   */
  func(type: WindowFuncOpt, id?: number, data?: any[]) {
    let win = id ? this.get(id) : this.getMain();
    if (!win) {
      console.error(`not found win -> ${id}`);
      return;
    }
    // @ts-ignore
    data ? win[type](...data) : win[type]();
    return;
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
   * 事件穿透
   */
  setIgnoreMouseEvents(args: { id: number; is: boolean; forward?: boolean }) {
    const win = this.get(args.id);
    if (!win) {
      console.error('Invalid id, the id can not be a empty');
      return;
    }
    win.setIgnoreMouseEvents(args.is, { forward: args.forward });
  }

  /**
   * 开启监听
   */
  on() {
    // 窗口数据更新
    preload.handle(WindowChannel.update, (_, args) => {
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
    preload.handle<number>(WindowChannel.maxMinSize, (_, args) => {
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
    preload.handle(WindowChannel.func, (_, args) => this.func(args.type, args.id, args.data));
    // 窗口状态
    preload.handle(WindowChannel.status, async (_, args) => this.getStatus(args.type, args.id));
    // 创建窗口
    preload.handle(WindowChannel.new, async (_, args) => {
      const newWin = await this.new(args.customize, args.windowOptions);
      if (newWin) {
        return {
          id: newWin.id,
          webContentsId: newWin.webContents.id
        };
      }
      return null;
    });
    // 窗口初始化加载
    preload.handle(WindowChannel.load, async (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error('fromWebContents not');
      return {
        winId: win.id,
        webContentsId: win.webContents.id,
        ...win.customize
      };
    });
    // 窗口重新加载
    preload.handle(WindowChannel.reload, async (event, args) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) throw new Error('fromWebContents not');
      await this.reload(win, args.loadType, args.url);
    });
    // 设置窗口是否置顶
    preload.handle(WindowChannel.setAlwaysTop, (_, args) => this.setAlwaysOnTop(args));
    // 设置窗口事件穿透
    preload.handle(WindowChannel.setIgnoreMouseEvents, (_, args) =>
      this.setIgnoreMouseEvents(args)
    );
    // 设置窗口大小
    preload.handle(WindowChannel.setSize, (_, args) => this.setSize(args));
    // 设置窗口(最小/最大)大小
    preload.handle(WindowChannel.setMinMaxSize, (_, args) =>
      args.type === 'min' ? this.setMinSize(args) : this.setMaxSize(args)
    );
    // 设置窗口背景颜色
    preload.handle(WindowChannel.setBackgroundColor, (_, args) => this.setBackgroundColor(args));
    // 窗口消息
    preload.handle<{
      id: number;
      channel: string;
      value: any;
      isback: boolean;
      acceptIds?: number[];
    }>(WindowChannel.sendMessage, (_, args) => {
      if (!args) return;
      const channel = `window-message-${args.channel}-back`;
      if (args.acceptIds && args.acceptIds.length > 0) {
        preload.send(channel, args.value, args.acceptIds);
      } else {
        args.acceptIds = this.getAll().map((win) => win.id);
        if (!args.isback) {
          args.acceptIds = args.acceptIds.filter((id) => id !== args.id);
        }
      }
      preload.send(channel, args.value, args.acceptIds);
    });
    preload.handle<{
      id: number;
      channel: string;
      value: any;
      isback: boolean;
      acceptIds?: number[];
    }>(WindowChannel.sendMessageContents, (_, args) => {
      if (!args) return;
      const channel = `window-message-contents-${args.channel}-back`;
      if (args.acceptIds && args.acceptIds.length > 0) {
        preload.sendByWebContents(channel, args.value, args.acceptIds);
      } else {
        args.acceptIds = webContents.getAllWebContents().map((webContent) => webContent.id);
        if (!args.isback) {
          args.acceptIds = args.acceptIds.filter((id) => id !== args.id);
        }
      }
      preload.sendByWebContents(channel, args.value, args.acceptIds);
    });
  }
}

export const windowInstance = Window.getInstance();
