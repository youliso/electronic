import type { LoadURLOptions, LoadFileOptions } from 'electron';

export type Position = 'center';

export interface Customize {
  /**
   * 窗口id
   */
  winId?: number;
  /**
   * 网页内容id
   */
  webContentsId?: number;
  /**
   * 标题 (仅路由下生效)
   */
  title?: string;
  /**
   * 指定网页
   */
  url?: string;
  /**
   * 指定路由
   */
  route?: string;
  /**
   * 加载方式（默认url）
   */
  loadType?: 'url' | 'file';
  /**
   * 基于父/主窗口位置默认（center）
   */
  position?: Position;
  /**
   * 参数数据
   */
  loadOptions?: LoadURLOptions | LoadFileOptions;
  /**
   * 父窗口id
   */
  parentId?: number;
  /**
   * 此路由是否单窗口
   */
  isOneWindow?: boolean;
  /**
   * 是否主窗口
   */
  isMainWin?: boolean;
  /**
   * 是否已打包环境
   */
  isPackaged?: boolean;
  /**
   * 是否独立弹框view
   */
  isAlone?: boolean;
  /**
   * 是否view
   */
  isView?: boolean;
  /**
   * 进程参数
   */
  argv?: any;
  /**
   * 自定义参数
   */
  data?: any;
  /**
   * 窗口不触发广播func
   */
  silenceFunc?: boolean;
}

export interface Window {
  customize: Customize;
}

export type WindowAlwaysOnTopOpt =
  | 'normal'
  | 'floating'
  | 'torn-off-menu'
  | 'modal-panel'
  | 'main-menu'
  | 'status'
  | 'pop-up-menu'
  | 'screen-saver';

export type WindowFuncOpt =
  | 'focus'
  | 'blur'
  | 'close'
  | 'hide'
  | 'show'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'reload'
  | 'flashFrame'
  | 'setPosition';

export type WindowStatusOpt =
  | 'isMaximized'
  | 'isMinimized'
  | 'isFullScreen'
  | 'isAlwaysOnTop'
  | 'isVisible'
  | 'isFocused'
  | 'isModal';

export interface UpdateMessage {
  code: number;
  msg: string;
  value?: any;
}

export type Accelerator = {
  // 名称
  name: string;
  key: string | string[];
  callback: () => void;
};

export interface Window {
  customize: Customize;
}

export interface AppInfo {
  name: string;
  version: string;
}

export type AppPathKey =
  | 'home'
  | 'appData'
  | 'userData'
  | 'cache'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps';

export interface UpdateMessage {
  code: number;
  msg: string;
  value?: any;
}
