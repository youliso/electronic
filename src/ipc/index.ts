export * from './app';
export * from './shortcut';
export * from './store';
export * from './window';
export * from './machine';

/**
 * 主进程消息监听
 */
export function ipcRendererOn(channel: string, listener: (...args: any[]) => void) {
  window.electronic.on(channel, listener);
}

/**
 * 主进程消息监听(触发后销毁)
 */
export function ipcRendererOnce(channel: string, listener: (...args: any[]) => void) {
  window.electronic.once(channel, listener);
}

/**
 * 监听销毁
 */
export function ipcRemoveAllListeners(channel: string) {
  window.electronic.removeAllListeners(channel);
}
