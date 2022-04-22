import type { IpcRendererEvent } from "electron";
import type { Accelerator } from "../types";
/**
 * 快捷键监听
 * @param listener
 */
export declare function shortcutOn(listener: (event: IpcRendererEvent, args: any) => void): void;
/**
 * 注册快捷键 (重复注册将覆盖)
 * @param name
 * @param key
 */
export declare function shortcut(name: string, key: string | string[]): Promise<void>;
/**
 * 清除快捷键
 * @param key
 */
export declare function unShortcut(key: string): Promise<void>;
/**
 * 清空全部快捷键
 */
export declare function unShortcutAll(): Promise<void>;
/**
 * 获取已注册快捷键
 * @param key
 */
export declare function shortcutGet(key: string): Promise<Accelerator>;
/**
 * 获取全部已注册快捷键
 */
export declare function shortcutGetAll(): Promise<Accelerator[]>;
/**
 * 获取快捷键以文本展示
 * @param e
 * @returns String Ctrl + A
 */
export declare function getShortcutName(e: KeyboardEvent): string;
