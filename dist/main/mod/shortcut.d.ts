import type { Accelerator } from "../types";
declare class Shortcut {
    private static instance;
    private data;
    static getInstance(): Shortcut;
    constructor();
    /**
     * 添加已注册快捷键
     * @param accelerator
     */
    private set;
    /**
     * 获取已注册快捷键
     * @param key
     */
    get(key: string): Accelerator | null;
    /**
     * 获取全部已注册快捷键
     */
    getAll(): Accelerator[];
    /**
     * 删除已注册快捷键
     * @param key
     */
    private del;
    /**
     * 清空已注册快捷键
     */
    private delAll;
    /**
     * 注册快捷键 (重复注册将覆盖)
     * @param accelerator
     */
    register(accelerator: Accelerator): void;
    /**
     * 清除快捷键
     */
    unregister(key: string | string[]): void;
    /**
     * 清空全部快捷键
     */
    unregisterAll(): void;
    /**
     * 监听
     */
    on(): void;
}
export declare const shortcutInstance: Shortcut;
export {};
