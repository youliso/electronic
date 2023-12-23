import type { IpcRendererEvent } from 'electron';
import type { UpdateMessage } from '../types';
import { UpdateChannel } from '../preload/channel';
/**
 * 更新监听
 */
export function updateOn(listener: (event: IpcRendererEvent, args: UpdateMessage) => void) {
  window.ipc.on('update-back', listener);
}

/**
 * 关闭监听
 */
export function updateListenersRemove() {
  window.ipc.removeAllListeners('update-back');
}

/**
 * 检查更新
 * @param isDel 是否删除历史更新缓存
 * @param autoDownload 是否在找到更新时自动下载更新
 * @param url 更新地址（不传用默认地址）
 */
export function updateCheck(isDel: boolean = true, autoDownload: boolean = false, url?: string) {
  window.ipc.send(UpdateChannel.check, { isDel, autoDownload, url });
}

/**
 * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
 */
export function updateDownload() {
  window.ipc.send(UpdateChannel.download);
}

/**
 * 关闭程序进行更新
 * @param isSilent 是否静默更新
 */
export function updateInstall(isSilent: boolean) {
  window.ipc.send(UpdateChannel.install, isSilent);
}
