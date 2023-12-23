import type { AppInfo, AppPathKey } from '../types';
import { AppChannel, LogChannel, MachineChannel, StoreChannel } from '../preload/channel';

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
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
export async function sendGlobal(key: string, value: unknown): Promise<void> {
  return await window.ipc.invoke(StoreChannel.set, {
    key,
    value
  });
}

/**
 * 获取全局参数
 * @param key 键
 */
export async function getGlobal<T>(key: string): Promise<T> {
  return await window.ipc.invoke(StoreChannel.get, key);
}

/**
 * app退出
 */
export function quit() {
  window.ipc.send(AppChannel.Quit);
}

/**
 * app重启
 * @param once 是否立即重启
 */
export function relaunch(once: boolean): void {
  return window.ipc.send(AppChannel.Relaunch, once);
}

/**
 * app常用信息
 * @returns
 */
export async function getAppInfo(): Promise<AppInfo> {
  return await window.ipc.invoke(AppChannel.InfoGet);
}

/**
 * app常用获取路径
 */
export async function getAppPath(key: AppPathKey): Promise<string> {
  return await window.ipc.invoke(AppChannel.PathGet, key);
}

/**
 * app打开url
 */
export async function openUrl(url: string): Promise<void> {
  return await window.ipc.invoke(AppChannel.OpenUrl, url);
}

/**
 * 获取设备唯一吗
 */
export async function getMachineGuid(): Promise<string> {
  return await window.ipc.invoke(MachineChannel.get);
}
