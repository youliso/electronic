import type { BrowserViewConstructorOptions, IpcRendererEvent } from 'electron';
import { ViewChannel } from '../preload/channel';

export interface ViewOpt {
  key: string;
  winId: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  webPreferences?: BrowserViewConstructorOptions;
  url: string;
  data?: any;
}

/**
 * view创建
 * @param opt
 */
export async function viewCreate(
  opt: ViewOpt,
  isAlone: boolean = false
): Promise<number | undefined> {
  opt.webPreferences = opt.webPreferences || {};
  return await window.ipc.invoke(ViewChannel.new, { opt, isAlone });
}

/**
 * view是否存在
 * @param key
 */
export async function viewExist(key: string): Promise<boolean> {
  return await window.ipc.invoke(ViewChannel.exist, { key });
}

/**
 * view切换挂载
 * @param key
 * @param winId
 */
export async function viewAlone(
  key: string,
  winId: number,
  opt: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }
): Promise<number | undefined> {
  return await window.ipc.invoke(ViewChannel.alone, { key, winId, opt });
}

/**
 * view监听独立打开
 */
export async function viewAloneOn(
  listener: (event: any, args: { winId: number; isAlone: boolean }) => void
) {
  window.ipc.on('view-alone-load', listener);
}

/**
 * view隐藏
 * @param key
 */
export async function viewHide(key: string): Promise<void> {
  return await window.ipc.invoke(ViewChannel.hide, { key });
}

/**
 * view隐藏全部
 */
export async function viewHideAll(winId?: number): Promise<void> {
  return await window.ipc.invoke(ViewChannel.hideAll, { winId });
}

/**
 * view显示
 * @param key
 */
export async function viewShow(key: string): Promise<void> {
  return await window.ipc.invoke(ViewChannel.show, { key });
}

/**
 * view卸载
 * @param key
 */
export async function viewRemove(key: string): Promise<void> {
  return await window.ipc.invoke(ViewChannel.remove, { key });
}

/**
 * view卸载全部
 */
export async function viewRemoveAll(winId?: number): Promise<void> {
  return await window.ipc.invoke(ViewChannel.removeAll, { winId });
}

/**
 * view更新title监听
 */
export async function viewTitleUpdate(
  listener: (event: IpcRendererEvent, args: { key: string; title: string }) => void
): Promise<void> {
  window.ipc.removeAllListeners('view-title-update');
  window.ipc.on('view-title-update', listener);
}

/**
 * view更新page监听
 */
export async function viewPageUpdate(
  listener: (
    event: IpcRendererEvent,
    args: { key: string; canGoBack: boolean; canGoForward: boolean }
  ) => void
): Promise<void> {
  window.ipc.removeAllListeners('view-page-update');
  window.ipc.on('view-page-update', listener);
}

/**
 * https://www.electronjs.org/zh/docs/latest/api/web-contents
 */

export async function stop(key: string) {
  return await window.ipc.invoke(ViewChannel.stop, { key });
}

export async function reload(key: string) {
  return await window.ipc.invoke(ViewChannel.reload, { key });
}

export async function setBounds(
  key: string,
  opt: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }
) {
  return await window.ipc.invoke(ViewChannel.setBounds, { key, opt });
}

export async function canGoBack(key: string) {
  return await window.ipc.invoke(ViewChannel.canGoBack, { key });
}

export async function goBack(key: string) {
  return await window.ipc.invoke(ViewChannel.goBack, { key });
}

export async function canGoForward(key: string) {
  return await window.ipc.invoke(ViewChannel.canGoForward, { key });
}

export async function goForward(key: string) {
  return await window.ipc.invoke(ViewChannel.goForward, { key });
}

export async function openDevTools(key: string) {
  return await window.ipc.invoke(ViewChannel.openDevTools, { key });
}
