import type { BrowserWindowConstructorOptions } from 'electron';
import type { Customize, WindowAlwaysOnTopOpt, WindowFuncOpt, WindowStatusOpt } from '../types';
import { BrowserWindow } from 'electron';
export declare class Window {
    private static instance;
    static getInstance(): Window;
    constructor();
    /**
     * 获取窗口
     * @param id 窗口id
     * @constructor
     */
    get(id: number): Electron.BrowserWindow | null;
    /**
     * 获取全部窗口
     */
    getAll(): Electron.BrowserWindow[];
    /**
     * 获取主窗口(无主窗口获取后存在窗口)
     */
    getMain(): BrowserWindow | null;
    /**
     * 创建窗口
     * */
    create(customize: Customize, bwOptions?: BrowserWindowConstructorOptions): Promise<number | undefined>;
    /**
     * 窗口关闭、隐藏、显示等常用方法
     */
    func(type: WindowFuncOpt, id?: number, data?: any[]): void;
    /**
     * 窗口发送消息
     */
    send(key: string, value: any, id?: number): void;
    /**
     * 窗口状态
     */
    getStatus(type: WindowStatusOpt, id: number): boolean | undefined;
    /**
     * 设置窗口最小大小
     */
    setMinSize(args: {
        id: number;
        size: number[];
    }): void;
    /**
     * 设置窗口最大大小
     */
    setMaxSize(args: {
        id: number;
        size: number[];
    }): void;
    /**
     * 设置窗口大小
     */
    setSize(args: {
        id: number;
        size: number[];
        resizable: boolean;
        center: boolean;
    }): void;
    /**
     * 设置窗口背景色
     */
    setBackgroundColor(args: {
        id: number;
        color: string;
    }): void;
    /**
     * 设置窗口是否置顶
     */
    setAlwaysOnTop(args: {
        id: number;
        is: boolean;
        type?: WindowAlwaysOnTopOpt;
    }): void;
    /**
     * 开启监听
     */
    on(): void;
}
export declare const windowInstance: Window;
