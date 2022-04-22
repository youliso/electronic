import type { IpcRendererEvent, BrowserWindowConstructorOptions } from 'electron';
import type { Customize, WindowAlwaysOnTopOpt, WindowFuncOpt, WindowStatusOpt } from '../types';
/**
 * 窗口初始化 (i)
 * */
export declare function windowLoad(listener: (event: IpcRendererEvent, args: Customize) => void): void;
/**
 * 窗口数据更新
 */
export declare function windowUpdate(route: string): void;
/**
 * 窗口聚焦失焦监听
 */
export declare function windowBlurFocusOn(listener: (event: IpcRendererEvent, args: 'blur' | 'focus') => void): void;
/**
 * 关闭窗口聚焦失焦监听
 */
export declare function windowBlurFocusRemove(): void;
/**
 * 窗口大小化监听
 */
export declare function windowMaximizeOn(listener: (event: IpcRendererEvent, args: 'maximize' | 'unmaximize') => void): void;
/**
 * 关闭窗口大小化监听
 */
export declare function windowMaximizeRemove(): void;
/**
 * 窗口消息监听
 */
export declare function windowMessageOn(listener: (event: IpcRendererEvent, args: any) => void, channel?: string): void;
/**
 * 关闭窗口消息监听
 */
export declare function windowMessageRemove(channel?: string): void;
/**
 * 消息发送
 */
export declare function windowMessageSend(value: any, //需要发送的内容
acceptIds?: number[], //指定窗口id发送
channel?: string, //监听key（保证唯一）
isback?: boolean): void;
/**
 * 创建窗口
 */
export declare function windowCreate(customize: Customize, opt?: BrowserWindowConstructorOptions): Promise<number | undefined>;
/**
 * 窗口状态
 */
export declare function windowStatus(type: WindowStatusOpt, id?: number): Promise<boolean>;
/**
 * 窗口置顶
 */
export declare function windowAlwaysOnTop(is: boolean, type?: WindowAlwaysOnTopOpt, id?: number): void;
/**
 * 设置窗口大小
 */
export declare function windowSetSize(size: number[], resizable?: boolean, center?: boolean, id?: number): void;
/**
 * 设置窗口 最大/最小 大小
 */
export declare function windowSetMaxMinSize(type: 'max' | 'min', size: number | undefined[], id?: number): void;
/**
 * 设置窗口背景颜色
 */
export declare function windowSetBackgroundColor(color: string, id?: number): void;
/**
 * 最大化&最小化当前窗口
 */
export declare function windowMaxMin(id?: number): void;
/**
 * 关闭窗口 (传id则对应窗口否则全部窗口)
 */
export declare function windowClose(id?: number): void;
/**
 * 窗口显示
 * @param id 窗口id
 * @param time 延迟显示时间
 */
export declare function windowShow(time?: number, id?: number): void;
/**
 * 窗口隐藏
 */
export declare function windowHide(id?: number): void;
/**
 * 最小化窗口 (传id则对应窗口否则全部窗口)
 */
export declare function windowMin(id?: number): void;
/**
 * 最大化窗口 (传id则对应窗口否则全部窗口)
 */
export declare function windowMax(id?: number): void;
/**
 * window函数
 */
export declare function windowFunc(type: WindowFuncOpt, data?: any[], id?: number): void;
/**
 * 通过路由获取窗口id (不传route查全部)
 */
export declare function windowIdGet(route?: string): Promise<number[]>;
