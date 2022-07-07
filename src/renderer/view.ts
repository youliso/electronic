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
