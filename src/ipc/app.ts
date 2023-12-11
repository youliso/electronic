import type { AppInfo, AppPathKey, Customize } from '../types';

/**
 * 日志(info)
 * @param args
 */
export function logInfo(...args: any): void {
  window.ipc.send('log-info', args);
}

/**
 * 日志(error)
 * @param args
 */
export function logError(...args: any): void {
  window.ipc.send('log-error', args);
}

/**
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
export async function sendGlobal(key: string, value: unknown): Promise<void> {
  return await window.ipc.invoke('global-sharedObject-set', {
    key,
    value
  });
}

/**
 * 获取全局参数
 * @param key 键
 */
export async function getGlobal<T>(key: string): Promise<T> {
  return await window.ipc.invoke('global-sharedObject-get', key);
}

/**
 * app退出
 */
export function quit() {
  window.ipc.send('app-quit');
}

/**
 * app重启
 * @param once 是否立即重启
 */
export function relaunch(once: boolean): void {
  return window.ipc.send('app-relaunch', once);
}

/**
 * app常用信息
 * @returns
 */
export async function getAppInfo(): Promise<AppInfo> {
  return await window.ipc.invoke('app-info-get');
}

/**
 * app常用获取路径
 */
export async function getAppPath(key: AppPathKey): Promise<string> {
  return await window.ipc.invoke('app-path-get', key);
}

/**
 * app打开url
 */
export async function openUrl(url: string): Promise<void> {
  return await window.ipc.invoke('app-open-url', url);
}

/**
 * 获取设备唯一吗
 */
export async function getMachineGuid(): Promise<string> {
  return await window.ipc.invoke('machineguid-get');
}

/**
 * 窗口数据更新
 */
export function updateCustomize(customize: Customize) {
  window.ipc.send('window-update', customize);
}
