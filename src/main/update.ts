import type { AllPublishOptions } from 'builder-util-runtime';
import type { AppUpdater, Logger } from 'electron-updater';
import { join } from 'path';
import { AppImageUpdater, MacUpdater, NsisUpdater } from 'electron-updater';
import { app } from 'electron';
import { delDir } from './utils';
import { preload } from '../preload/main';

/**
 * 更新模块 https://www.electron.build/auto-update
 * */
export class Update {
  public autoUpdater: AppUpdater;

  public options: AllPublishOptions;
  public dirname: string | undefined;

  constructor(
    options: AllPublishOptions,
    dirname?: string,
    defaultConfigPath?: string,
    logger?: Logger
  ) {
    this.options = options;
    dirname && (this.dirname = dirname);
    if (process.platform === 'win32') this.autoUpdater = new NsisUpdater(this.options);
    else if (process.platform === 'darwin') this.autoUpdater = new MacUpdater(this.options);
    else this.autoUpdater = new AppImageUpdater(this.options);
    // 本地开发环境，使用调试app-update.yml地址
    if (defaultConfigPath && !app.isPackaged) {
      // 开启调试更新
      this.autoUpdater.forceDevUpdateConfig = true;
      this.autoUpdater.updateConfigPath = join(defaultConfigPath);
    }
    logger && (this.autoUpdater.logger = logger);
  }

  /**
   * 删除更新包文件
   */
  handleUpdate() {
    if (!this.dirname) return;
    const updatePendingPath = join(
      // @ts-ignore
      this.autoUpdater.app.baseCachePath,
      this.dirname,
      'pending'
    );
    try {
      delDir(updatePendingPath);
    } catch (e) {}
  }

  /**
   * 检查更新
   */
  open(callback: Function) {
    this.autoUpdater.on('error', (error) =>
      callback({
        code: 0,
        data: error
      })
    );
    this.autoUpdater.on('checking-for-update', () =>
      callback({
        code: 1
      })
    );
    this.autoUpdater.on('update-available', (data) =>
      callback({
        code: 2,
        data
      })
    );
    this.autoUpdater.on('update-not-available', (data) =>
      callback({
        code: 5,
        data
      })
    );
    // 更新下载进度事件
    this.autoUpdater.on('download-progress', (data) =>
      callback({
        code: 3,
        data
      })
    );
    // 下载完成事件
    this.autoUpdater.on('update-downloaded', (data) =>
      callback({
        code: 4,
        data
      })
    );
  }

  /**
   * 检查更新
   * @param isDel 是否删除历史更新缓存
   * @param autoDownload 是否在找到更新时自动下载更新
   * @param url 更新地址（不传用默认地址）
   */
  checkUpdate(isDel: boolean, autoDownload: boolean = false, url?: string) {
    if (isDel) this.handleUpdate();
    url && this.autoUpdater.setFeedURL(url);
    this.autoUpdater.autoDownload = autoDownload;
    return this.autoUpdater.checkForUpdates();
  }

  /**
   * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
   */
  downloadUpdate() {
    return this.autoUpdater.downloadUpdate(); //TODO待完善
  }

  /**
   * 关闭程序进行更新
   * @param isSilent 是否静默更新
   */
  updateQuitInstall(isSilent: boolean = false) {
    this.autoUpdater.quitAndInstall(isSilent);
  }

  /**
   * 开启监听
   */
  on() {
    //开启更新监听
    this.open((data: { key: string; value: any }) => preload.send('update-back', data));
    //检查更新
    preload.handle('update-check', (event, args) =>
      this.checkUpdate(args.isDel, args.autoDownload, args.url)
    );
    //手动下载更新
    preload.handle('update-download', (event, args) => this.downloadUpdate());
    // 关闭程序安装新的软件 isSilent 是否静默更新
    preload.handle<boolean>('update-install', (event, args) => this.updateQuitInstall(args));
  }
}
