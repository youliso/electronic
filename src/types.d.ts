import type { LoadURLOptions, LoadFileOptions } from 'electron';

declare global {
  namespace Electron {
    interface BrowserWindow {
      customize: WindowOptions;
    }

    interface BrowserWindowConstructorOptions {
      customize?: WindowOptions;
    }
  }
}

interface BaseWindowOptions {
  /**
   * 标题 (仅路由下生效)
   */
  title?: string;
  /**
   * 父窗口id
   */
  parentId?: number;
  /**
   * 自定义参数
   */
  data?: any;
}

export type Position =
  | 'left'
  | 'left-top'
  | 'left-bottom'
  | 'right'
  | 'right-top'
  | 'right-bottom'
  | 'center'
  | 'center-top'
  | 'center-bottom';

// 窗口创建参数
export interface WindowOptions extends BaseWindowOptions {
  /**
   * 加载方式
   */
  loadType: 'url' | 'file';
  /**
   * 指定网页
   */
  url: string;
  /**
   * 可用来标识窗口的唯一key
   */
  key?: string;
  /**
   * 窗口位置
   */
  position?: Position;
  /**
   * 窗口位置边距
   */
  positionPadding?: number;
  /**
   * 窗口位置是否根据父窗口计算
   */
  isParentPosition?: boolean;
  /**
   * 参数数据
   */
  loadOptions?: LoadURLOptions | LoadFileOptions;
  /**
   * 此路由是否单窗口(仅存在key时生效)
   */
  isOneWindow?: boolean;
  /**
   * 是否主窗口
   */
  isMainWin?: boolean;
}

// 窗口信息(渲染进程使用)
export interface WindowInfo extends BaseWindowOptions {
  /**
   * 可用来标识窗口的唯一key
   */
  key: string;
  /**
   * 窗口id
   */
  winId?: number;
  /**
   * 网页内容id
   */
  webContentsId?: number;
  /**
   * 进程参数
   */
  argv?: any;
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

export type Accelerator = {
  name: string;
  key: string | string[];
  callback?: () => void;
};

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
