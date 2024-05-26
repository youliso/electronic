import { StoreChannel } from '../preload/channel';

/**
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
export function setStore(key: string, value: unknown): Promise<void> {
  return window.electronic.invoke(StoreChannel.set, {
    key,
    value
  });
}

/**
 * 获取全局参数
 * @param key 键
 */
export function getStore<T>(key: string): Promise<T> {
  return window.electronic.invoke(StoreChannel.get, { key });
}
