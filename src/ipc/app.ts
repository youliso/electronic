import type { AppInfo, AppPathKey } from '../types';
import { AppChannel, LogChannel, MachineChannel } from '../preload/channel';

/**
 * 日志(info)
 * @param args
 */
export function logInfo(...args: any): void {
  window.ipc.send(LogChannel.info, args);
}

/**
 * 日志(error)
 * @param args
 */
export function logError(...args: any): void {
  window.ipc.send(LogChannel.error, args);
}

/**
 * app退出
 */
export function quit() {
  window.ipc.send(AppChannel.quit);
}

/**
 * app重启
 * @param once 是否立即重启
 */
export function relaunch(once: boolean): void {
  return window.ipc.send(AppChannel.relaunch, once);
}

/**
 * app常用信息
 * @returns
 */
export async function getAppInfo(): Promise<AppInfo> {
  return await window.ipc.invoke(AppChannel.getInfo);
}

/**
 * app常用获取路径
 */
export async function getAppPath(key: AppPathKey): Promise<string> {
  return await window.ipc.invoke(AppChannel.getPath, key);
}

/**
 * app打开url
 */
export async function openUrl(url: string): Promise<void> {
  return await window.ipc.invoke(AppChannel.openUrl, url);
}

/**
 * 获取设备唯一吗
 */
export async function getMachineGuid(): Promise<string> {
  return await window.ipc.invoke(MachineChannel.get);
}
