import type { AppInfo, AppPathKey } from '../types';
import { AppChannel, LogChannel, MachineChannel } from '../preload/channel';

/**
 * 日志(info)
 * @param args
 */
export function logInfo(...args: any): void {
  window.electronic.send(LogChannel.info, args);
}

/**
 * 日志(error)
 * @param args
 */
export function logError(...args: any): void {
  window.electronic.send(LogChannel.error, args);
}

/**
 * app退出
 */
export function quit() {
  window.electronic.send(AppChannel.quit);
}

/**
 * app重启
 * @param once 是否立即重启
 */
export function relaunch(once: boolean): void {
  return window.electronic.send(AppChannel.relaunch, once);
}

/**
 * app常用信息
 * @returns
 */
export async function getAppInfo(): Promise<AppInfo> {
  return await window.electronic.invoke(AppChannel.getInfo);
}

/**
 * app常用获取路径
 */
export async function getAppPath(key: AppPathKey): Promise<string> {
  return await window.electronic.invoke(AppChannel.getPath, key);
}

/**
 * app打开url
 */
export async function openUrl(url: string): Promise<void> {
  return await window.electronic.invoke(AppChannel.openUrl, url);
}

/**
 * 获取设备唯一吗
 */
export async function getMachineGuid(): Promise<string> {
  return await window.electronic.invoke(MachineChannel.get);
}
