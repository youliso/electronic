import type { AppInfo, AppPathKey } from "../types";
/**
 * 日志(info)
 * @param args
 */
export declare function logInfo(...args: any): void;
/**
 * 日志(error)
 * @param args
 */
export declare function logError(...args: any): void;
/**
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
export declare function sendGlobal(key: string, value: unknown): Promise<void>;
/**
 * 获取全局参数
 * @param key 键
 */
export declare function getGlobal<T>(key: string): Promise<T>;
/**
 * 获取依赖文件路径
 * */
export declare function getResourcesPath(type: "platform" | "inside" | "extern" | "root", path?: string): Promise<string>;
/**
 * app重启
 * @param once 是否立即重启
 */
export declare function relaunch(once: boolean): void;
/**
 * app常用信息
 * @returns
 */
export declare function getAppInfo(): Promise<AppInfo>;
/**
 * app常用获取路径
 */
export declare function getAppPath(key: AppPathKey): Promise<string>;
/**
 * app打开url
 */
export declare function openUrl(url: string): Promise<void>;
