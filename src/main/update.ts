import type { AllPublishOptions } from 'builder-util-runtime';
import type { AppUpdater, Logger } from 'electron-updater';
import type { UpdateMessage } from '../types';
import { join } from 'path';
import { AppImageUpdater, MacUpdater, NsisUpdater } from 'electron-updater';
import { ipcMain, app } from 'electron';
import { windowInstance } from './window';
import { UpdateChannel } from '../preload/channel';
import { delDir } from './utils';

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
      !(process.platform === 'darwin') &&
        (this.autoUpdater.updateConfigPath = join(defaultConfigPath));
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
    const message: { [key: string]: UpdateMessage } = {
      error: { code: 0, msg: '检查更新出错' },
      checking: { code: 1, msg: '正在检查更新' },
      updateAva: { code: 2, msg: '检测到新版本' },
      updateDown: { code: 3, msg: '下载中' },
      updateDownload: { code: 4, msg: '下载完成' },
      updateNotAva: { code: 5, msg: '当前为最新版本' }
    };
    this.autoUpdater.on('error', () => callback(message.error));
    this.autoUpdater.on('checking-for-update', () => callback(message.checking));
    this.autoUpdater.on('update-available', () => callback(message.updateAva));
    this.autoUpdater.on('update-not-available', () => callback(message.updateNotAva));
    // 更新下载进度事件
    this.autoUpdater.on('download-progress', (progressObj) => {
      message.updateDown.value = progressObj;
      callback(message.updateDown);
    });
    // 下载完成事件
    this.autoUpdater.on('update-downloaded', () => callback(message.updateDownload));
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
    this.open((data: { key: string; value: any }) => windowInstance.send('update-back', data));
    //检查更新
    ipcMain.handle(UpdateChannel.check, (event, args) =>
      this.checkUpdate(args.isDel, args.autoDownload, args.url)
    );
    //手动下载更新
    ipcMain.handle(UpdateChannel.download, (event, args) => this.downloadUpdate());
    // 关闭程序安装新的软件 isSilent 是否静默更新
    ipcMain.handle(UpdateChannel.install, (event, isSilent) => this.updateQuitInstall(isSilent));
  }
}
