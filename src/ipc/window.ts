import type { BrowserWindowConstructorOptions } from 'electron';
import type { Customize, WindowAlwaysOnTopOpt, WindowFuncOpt, WindowStatusOpt } from '../types';
import { WindowChannel } from '../preload/channel';

/**
 * 窗口初始化 (i)
 * */
export function windowLoad(listener: (args: Customize) => void) {
  window.ipc.once('window-load', listener);
}

/**
 * 窗口数据更新
 */
export function windowUpdateCustomize(customize: Customize) {
  window.ipc.send(WindowChannel.update, customize);
}

/**
 * usb插拔消息监听
 */
export function windowHookMessageUSB(listener: (wParam: Buffer, lParam: Buffer) => void) {
  window.ipc.on('window-hook-message', listener);
}

/**
 * 窗口聚焦失焦监听
 */
export function windowBlurFocusOn(listener: (args: 'blur' | 'focus') => void) {
  window.ipc.on('window-blur-focus', listener);
}

/**
 * 关闭窗口聚焦失焦监听
 */
export function windowBlurFocusRemove() {
  window.ipc.removeAllListeners('window-blur-focus');
}

/**
 * 窗口大小化监听
 */
export function windowMaximizeOn(listener: (args: 'maximize' | 'unmaximize') => void) {
  window.ipc.on('window-maximize-status', listener);
}

/**
 * 关闭窗口大小化监听
 */
export function windowMaximizeRemove() {
  window.ipc.removeAllListeners('window-maximize-status');
}

/**
 * 窗口消息监听
 */
export function windowMessageOnce(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.ipc.once(`window-message-${channel}-back`, listener);
}

/**
 * 窗口消息监听
 */
export function windowMessageOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.ipc.on(`window-message-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.ipc.removeAllListeners(`window-message-${channel}-back`);
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
  window.ipc.send(WindowChannel.sendMessage, {
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
  window.ipc.once(`window-message-contents-${channel}-back`, listener);
}

/**
 * 消息监听
 */
export function windowMessageContentsOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.ipc.on(`window-message-contents-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageContentsRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  window.ipc.removeAllListeners(`window-message-contents-${channel}-back`);
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
  window.ipc.send(WindowChannel.sendMessageContents, {
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
  return window.ipc.invoke(WindowChannel.new, { customize, windowOptions, loadOptions });
}

/**
 * 窗口状态
 */
export async function windowStatus(
  type: WindowStatusOpt,
  id: number = window.customize.winId as number
): Promise<boolean> {
  return await window.ipc.invoke(WindowChannel.status, { type, id });
}

/**
 * 窗口置顶
 */
export function windowAlwaysOnTop(
  is: boolean,
  type?: WindowAlwaysOnTopOpt,
  id: number = window.customize.winId as number
) {
  window.ipc.send(WindowChannel.setAlwaysTop, { id, is, type });
}

/**
 * 设置窗口大小
 */
export function windowSetSize(
  size: number[],
  resizable: boolean = true,
  center: boolean = false,
  id: number = window.customize.winId as number
) {
  window.ipc.send(WindowChannel.setSize, { id, size, resizable, center });
}

/**
 * 设置窗口 最大/最小 大小
 */
export function windowSetMaxMinSize(
  type: 'max' | 'min',
  size: number | undefined[],
  id: number = window.customize.winId as number
) {
  window.ipc.send(WindowChannel.setMinMaxSize, { type, id, size });
}

/**
 * 设置窗口背景颜色
 */
export function windowSetBackgroundColor(
  color: string,
  id: number = window.customize.winId as number
) {
  window.ipc.send(WindowChannel.setBackgroundColor, { id, color });
}

/**
 * 最大化&最小化当前窗口
 */
export function windowMaxMin(id: number = window.customize.winId as number) {
  window.ipc.send(WindowChannel.maxMinSize, id);
}

/**
 * 关闭窗口 (传id则对应窗口否则全部窗口)
 */
export function windowClose(id: number = window.customize.winId as number) {
  window.ipc.send(WindowChannel.func, { type: 'close', id });
}

/**
 * 窗口显示
 * @param id 窗口id
 * @param time 延迟显示时间
 */
export function windowShow(time: number = 0, id: number = window.customize.winId as number) {
  setTimeout(() => window.ipc.send(WindowChannel.func, { type: 'show', id }), time);
}

/**
 * 窗口隐藏
 */
export function windowHide(id: number = window.customize.winId as number) {
  window.ipc.send(WindowChannel.func, { type: 'hide', id });
}

/**
 * 最小化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMin(id: number = window.customize.winId as number) {
  window.ipc.send(WindowChannel.func, { type: 'minimize', id });
}

/**
 * 最大化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMax(id: number = window.customize.winId as number) {
  window.ipc.send(WindowChannel.func, { type: 'maximize', id });
}

/**
 * window函数
 */
export function windowFunc(
  type: WindowFuncOpt,
  data?: any[],
  id: number = window.customize.winId as number
) {
  window.ipc.send(WindowChannel.func, { type, data, id });
}

/**
 * 通过路由获取窗口id (不传route查全部)
 */
export async function windowIdGet(route?: string): Promise<number[]> {
  return await window.ipc.invoke(WindowChannel.getWinId, { route });
}
