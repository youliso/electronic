import type { AppInfo, AppPathKey } from '../types';
import { AppChannel } from '../preload/channel';

/**
 * app退出
 */
export function quit(): Promise<void> {
  return window.electronic.invoke(AppChannel.quit);
}

/**
 * app重启
 * @param once 是否立即重启
 */
export function relaunch(once: boolean): Promise<void> {
  return window.electronic.invoke(AppChannel.relaunch, once);
}

/**
 * app常用信息
 * @returns
 */
export function getAppInfo(): Promise<AppInfo> {
  return window.electronic.invoke(AppChannel.getInfo);
}

/**
 * app常用获取路径
 */
export function getAppPath(key: AppPathKey): Promise<string> {
  return window.electronic.invoke(AppChannel.getPath, key);
}

/**
 * app打开url
 */
export function openUrl(url: string): Promise<void> {
  return window.electronic.invoke(AppChannel.openUrl, url);
}