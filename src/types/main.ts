import type { LoadURLOptions, LoadFileOptions } from 'electron';

export interface Customize {
  // 窗口id
  winId?: number;
  webContentsId?: number;
  // 标题 (仅路由下生效)
  title?: string;
  // 是否使用原生标签栏（路由下默认关闭）
  headNative?: boolean;
  // 指定网页
  url?: string;
  // 指定路由
  route?: string;
  // 参数数据
  loadOptions?: LoadURLOptions | LoadFileOptions;
  // 父窗口id
  parentId?: number;
  // 父类窗口宽度
  currentWidth?: number;
  // 父类窗口高度
  currentHeight?: number;
  // 父类窗口是否全屏
  currentMaximized?: boolean;
  // 此路由是否单窗口
  isOneWindow?: boolean;
  // 是否主窗口
  isMainWin?: boolean;
  // 是否已打包环境
  isPackaged?: boolean;
  // 是否独立弹框view
  isAlone?: boolean;
  // 是否view
  isView?: boolean;
  // 进程参数
  argv?: any;
  // 自定义参数
  data?: any;
  // 窗口不触发广播func
  silenceFunc?: boolean;
}

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
  | 'close'
  | 'hide'
  | 'show'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'reload';

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
