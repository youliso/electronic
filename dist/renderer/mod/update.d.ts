import type { IpcRendererEvent } from 'electron';
import type { UpdateMessage } from '../types';
/**
 * 更新监听
 */
export declare function updateOn(listener: (event: IpcRendererEvent, args: UpdateMessage) => void): void;
/**
 * 关闭监听
 */
export declare function updateListenersRemove(): void;
/**
 * 检查更新
 * @param isDel 是否删除历史更新缓存
 * @param autoDownload 是否在找到更新时自动下载更新
 */
export declare function updateCheck(isDel?: boolean, autoDownload?: boolean): void;
/**
 * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
 */
export declare function updateDownload(): void;
/**
 * 关闭程序进行更新
 * @param isSilent 是否静默更新
 */
export declare function updateInstall(isSilent: boolean): void;
