import type {
  WindowOptions,
  WindowAlwaysOnTopOpt,
  WindowFuncOpt,
  WindowInfo,
  WindowStatusOpt
} from '../types';
import { WindowChannel } from '../channel';
import { preload } from '../preload/render';

/**
 * 窗口信息(windowLoad后赋值)
 */
export let windowInfo: WindowInfo;

/**
 * 窗口初始化
 * */
export function windowLoad(listener: () => void) {
  preload
    .invoke<WindowInfo>(WindowChannel.load)
    .then((info) => {
      windowInfo = info;
      listener();
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * 窗口重新加载
 */
export function windowReLoad(loadType: WindowOptions['loadType'], url: string) {
  return preload.invoke<void>(WindowChannel.reload, {
    loadType,
    url
  });
}

/**
 * 单例模式后协议再开触发
 */
export function windowSingleInstanceOn(listener: (argv?: string[]) => void) {
  preload.on<string[]>('window-single-instance', listener);
}

/**
 * 窗口再次创建触发
 */
export function windowSingleDataOn<T>(listener: (data?: T) => void) {
  preload.on<T>('window-single-data', listener);
}

/**
 * usb插拔消息监听
 */
export function windowHookMessageUSB(listener: (args: { wParam: Buffer; lParam: Buffer }) => void) {
  preload.on('window-hook-message', listener);
}

/**
 * 窗口聚焦失焦监听
 */
export function windowBlurFocusOn(listener: (args: 'blur' | 'focus') => void) {
  preload.on('window-blur-focus', listener);
}

/**
 * 关闭窗口聚焦失焦监听
 */
export function windowBlurFocusRemove() {
  preload.removeOn('window-blur-focus');
}

/**
 * 窗口大小化监听
 */
export function windowMaximizeOn(listener: (args: 'maximize' | 'unmaximize') => void) {
  preload.on('window-maximize-status', listener);
}

/**
 * 关闭窗口大小化监听
 */
export function windowMaximizeRemove() {
  preload.removeOn('window-maximize-status');
}

/**
 * 窗口消息监听
 */
export function windowMessageOnce(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.once(`window-message-${channel}-back`, listener);
}

/**
 * 窗口消息监听
 */
export function windowMessageOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.on(`window-message-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.removeOn(`window-message-${channel}-back`);
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
  return preload.invoke(WindowChannel.sendMessage, {
    channel,
    value,
    acceptIds,
    isback
  });
}

/**
 * 消息监听
 */
export function windowMessageContentsOnce(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.once(`window-message-contents-${channel}-back`, listener);
}

/**
 * 消息监听
 */
export function windowMessageContentsOn(channel: string, listener: (args: any) => void) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.on(`window-message-contents-${channel}-back`, listener);
}

/**
 * 关闭消息监听
 */
export function windowMessageContentsRemove(channel: string) {
  if (!channel) {
    throw new Error('not channel');
  }
  preload.removeOn(`window-message-contents-${channel}-back`);
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
  return preload.invoke(WindowChannel.sendMessageContents, {
    channel,
    value,
    acceptIds,
    isback
  });
}

/**
 * 窗口状态
 */
export function windowStatus(type: WindowStatusOpt, id?: number): Promise<boolean> {
  return preload.invoke(WindowChannel.status, { type, id });
}

/**
 * 窗口置顶
 */
export function windowAlwaysOnTop(is: boolean, type?: WindowAlwaysOnTopOpt, id?: number) {
  return preload.invoke(WindowChannel.setAlwaysTop, { id, is, type });
}

/**
 * 窗口事件穿透
 */
export function windowIgnoreMouseEvents(is: boolean, forward?: boolean, id?: number) {
  return preload.invoke(WindowChannel.setIgnoreMouseEvents, { id, is, forward });
}

/**
 * 设置窗口大小
 */
export function windowSetSize(
  size: number[],
  resizable: boolean = true,
  center: boolean = false,
  id?: number
) {
  return preload.invoke(WindowChannel.setSize, { id, size, resizable, center });
}

/**
 * 设置窗口 最大/最小 大小
 */
export function windowSetMaxMinSize(type: 'max' | 'min', size: number[], id?: number) {
  return preload.invoke(WindowChannel.setMinMaxSize, { type, id, size });
}

/**
 * 设置窗口背景颜色
 */
export function windowSetBackgroundColor(color: string, id?: number) {
  return preload.invoke(WindowChannel.setBackgroundColor, { id, color });
}

/**
 * 最大化&最小化当前窗口
 */
export function windowMaxMin(id?: number) {
  return preload.invoke(WindowChannel.maxMinSize, id);
}

/**
 * 关闭窗口 (传id则对应窗口否则全部窗口)
 */
export function windowClose(id?: number) {
  return preload.invoke(WindowChannel.func, { type: 'close', id });
}

/**
 * 窗口显示
 * @param id 窗口id
 * @param time 延迟显示时间
 */
export function windowShow(id?: number) {
  return preload.invoke(WindowChannel.func, { type: 'show', id });
}

/**
 * 窗口隐藏
 */
export function windowHide(id?: number) {
  return preload.invoke(WindowChannel.func, { type: 'hide', id });
}

/**
 * 最小化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMin(id?: number) {
  return preload.invoke(WindowChannel.func, { type: 'minimize', id });
}

/**
 * 最大化窗口 (传id则对应窗口否则全部窗口)
 */
export function windowMax(id?: number) {
  return preload.invoke(WindowChannel.func, { type: 'maximize', id });
}

/**
 * window函数
 */
export function windowFunc(type: WindowFuncOpt, data?: any[], id?: number) {
  return preload.invoke(WindowChannel.func, { type, data, id });
}
