import type { BrowserViewConstructorOptions } from "electron";

export interface ViewOpt {
  key: string;
  winId: number;
  owh: [number, number];
  webPreferences?: BrowserViewConstructorOptions;
  url: string;
  data?: any;
}

/**
 * view创建
 * @param opt
 */
export async function viewCreate(opt: ViewOpt): Promise<number | undefined> {
  opt.webPreferences = opt.webPreferences || {};
  return await window.ipc.invoke("view-new", { opt });
}

/**
 * view切换挂载
 * @param key
 * @param winId
 */
export async function viewAlone(
  key: string,
  winId: number
): Promise<number | undefined> {
  return await window.ipc.invoke("view-alone", { key, winId });
}

/**
 * view隐藏
 * @param key
 */
export async function viewHide(key: string): Promise<void> {
  return await window.ipc.invoke("view-hide", { key });
}

/**
 * view显示
 * @param key
 */
export async function viewShow(key: string): Promise<void> {
  return await window.ipc.invoke("view-show", { key });
}

/**
 * view卸载
 * @param key
 */
export async function viewRemove(key: string): Promise<void> {
  return await window.ipc.invoke("view-remove", { key });
}

/**
 * view隐藏全部
 */
export async function viewHideAll(): Promise<void> {
  return await window.ipc.invoke("view-hide-all");
}

/**
 * view卸载全部
 */
export async function viewRemoveAll(): Promise<void> {
  return await window.ipc.invoke("view-remove-all");
}
