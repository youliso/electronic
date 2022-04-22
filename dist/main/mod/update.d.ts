import type { AllPublishOptions } from 'builder-util-runtime';
import type { AppUpdater } from 'electron-updater';
/**
 * 更新模块 https://www.electron.build/auto-update
 * */
export declare class Update {
    autoUpdater: AppUpdater;
    options: AllPublishOptions;
    dirname: string;
    constructor(options: AllPublishOptions, dirname: string);
    /**
     * 删除更新包文件
     */
    handleUpdate(): void;
    /**
     * 检查更新
     */
    open(callback: Function): void;
    /**
     * 检查更新
     * @param isDel 是否删除历史更新缓存
     * @param autoDownload 是否在找到更新时自动下载更新
     */
    checkUpdate(isDel: boolean, autoDownload?: boolean): void;
    /**
     * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
     */
    downloadUpdate(): void;
    /**
     * 关闭程序进行更新
     * @param isSilent 是否静默更新
     */
    updateQuitInstall(isSilent?: boolean): void;
    /**
     * 开启监听
     */
    on(): void;
}
