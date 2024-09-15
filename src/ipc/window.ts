import type { BrowserWindowConstructorOptions } from 'electron';
import type { Customize, WindowAlwaysOnTopOpt, WindowFuncOpt, WindowStatusOpt } from '../types';
import { WindowChannel } from '../preload/channel';

/**
 * 窗口初始化
 * */
export function windowLoad(listener: () => void) {
  window.electronic
    .invoke<void, typeof window.customize>(WindowChannel.load)
    .then((customize) => {
      window.customize = customize;
      listener();
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * 单例模式后协议再开触发
 */
export function windowSingleInstanceOn(listener: (argv?: string[]) => void) {
  window.electronic.on<string[]>('window-single-instance', (argv) => listener(argv));
}

/**
 * 窗口再次创建触发
 */
export function windowSingleDataOn<T>(listener: (data?: T) => void) {
  window.electronic.on<T>('window-single-data', (data) => listener(data));
}

/**
 * 窗口数据更新
 */
export function windowUpdateCustomize(customize: Customize) {
  return window.electronic.invoke(WindowChannel.update, customize);
}

/**
 * usb插拔消息监听
 */
export function windowHookMessageUSB(listener: (wParam: Buffer, lParam: Buffer) => void) {
  window.electronic.on('window-hook-message', listener);
}

/**
 * 窗口聚焦失焦监听
 */
export function windowBlurFocusOn(listener: (args: 'blur' | 'focus') => void) {
  window.electronic.on('window-blur-focus', listener);
}

/**
 * 关闭窗口聚焦失焦监听
 */
export function windowBlurFocusRemove() {
  window.electronic.removeAllListeners('window-blur-focus');
}

/**
 * 窗口大小化监听
 */
export function windowMaximizeOn(listener: (args: 'maximize' | 'unmaximize') => void) {
  window.electronic.on('window-maximize-status', listener);
}

/**
 * 关闭窗口大小化监听
 */
export function windowMaximizeRemove() {
  window.electronic.removeAllListeners('window-maximize-status');
}

/**
 * 窗口消息监听
 */
export function windowMessageOnce(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.once(`window-message-${channel}-back`, listener);
}

/**
 * 窗口消息监听
 */
export function windowMessageOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.on(`window-message-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.removeAllListeners(`window-message-${channel}-back`);
}

/**
 * 消息发送
 */
export function windowMessageSend(
  channel: string, //监听key（保证唯一）
  value: any, //需要发送的内容
  acceptIds: number[] = [], //指定窗口id发送
  isback: boolean = false //是否给自身反馈
) {
  if (!channel) {
    throw new Error('not channel');
  }
  return window.electronic.invoke(WindowChannel.sendMessage, {
    channel,
    value,
    acceptIds,
    isback,
    id: window.customize.winId
  });
}

/**
 * 消息监听
 */
export function windowMessageContentsOnce(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.once(`window-message-contents-${channel}-back`, listener);
}

/**
 * 消息监听
 */
export function windowMessageContentsOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.on(`window-message-contents-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageContentsRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.electronic.removeAllListeners(`window-message-contents-${channel}-back`);
}

/**
 * 消息发送
 */
export function windowMessageContentsSend(
  channel: string, //监听key（保证唯一）
  value: any, //需要发送的内容
  acceptIds: number[] = [], //指定webContetsId发送
  isback: boolean = false //是否给自身反馈
) {
  if (!channel) {
    throw new Error('not channel');
  }
  return window.electronic.invoke(WindowChannel.sendMessageContents, {
    channel,
    value,
    acceptIds,
    isback,
    id: window.customize.webContentsId
  });
}

export interface LoadOptions {
  openDevTools?: boolean;
}

/**
 * 创建并加载窗口
 */
export function windowCreate(
  customize: Customize,
  windowOptions?: BrowserWindowConstructorOptions,
  loadOptions?: LoadOptions
): Promise<{ id: number; webContentsId: number } | undefined> {
  return window.electronic.invoke(WindowChannel.new, { customize, windowOptions, loadOptions });
}

/**
 * 窗口状态
 */
export function windowStatus(
  type: WindowStatusOpt,
  id: number = window.customize.winId
): Promise<boolean> {
  return window.electronic.invoke(WindowChannel.status, { type, id });
}

/**
 * 窗口置顶
 */
export function windowAlwaysOnTop(
  is: boolean,
  type?: WindowAlwaysOnTopOpt,
  id: number = window.customize.winId
) {
  return window.electronic.invoke(WindowChannel.setAlwaysTop, { id, is, type });
}

/**
 * 设置窗口大小
 */
export function windowSetSize(
  size: number[],
  resizable: boolean = true,
  center: boolean = false,
  id: number = window.customize.winId
) {
  return window.electronic.invoke(WindowChannel.setSize, { id, size, resizable, center });
}

/**
 * 设置窗口 最大/最小 大小
 */
export function windowSetMaxMinSize(
  type: 'max' | 'min',
  size: number[],
  id: number = window.customize.winId
) {
  return window.electronic.invoke(WindowChannel.setMinMaxSize, { type, id, size });
}

/**
 * 设置窗口背景颜色
 */
export function windowSetBackgroundColor(color: string, id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.setBackgroundColor, { id, color });
}

/**
 * 最大化&最小化当前窗口
 */
export function windowMaxMin(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.maxMinSize, id);
}

/**
 * 关闭窗口 (传id则对应窗口否则全部窗口)
 */
export function windowClose(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type: 'close', id });
}

/**
 * 窗口显示
 * @param id 窗口id
 * @param time 延迟显示时间
 */
export function windowShow(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type: 'show', id });
}

/**
 * 窗口隐藏
 */
export function windowHide(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type: 'hide', id });
}

/**
 * 最小化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMin(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type: 'minimize', id });
}

/**
 * 最大化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMax(id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type: 'maximize', id });
}

/**
 * window函数
 */
export function windowFunc(type: WindowFuncOpt, data?: any[], id: number = window.customize.winId) {
  return window.electronic.invoke(WindowChannel.func, { type, data, id });
}

/**
 * 通过路由获取窗口id (不传route查全部)
 */
export function windowIdGet(route?: string): Promise<number[]> {
  return window.electronic.invoke(WindowChannel.getWinId, { route });
}
