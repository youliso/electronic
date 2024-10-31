import { preload } from '../preload';
import { StoreChannel } from '../channel';

/**
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
export function setStore(key: string, value: unknown): Promise<void> {
  return preload.invoke(StoreChannel.set, {
    key,
    value
  });
}

/**
 * 获取全局参数
 * @param key 键
 */
export function getStore<T>(key: string): Promise<T> {
  return preload.invoke(StoreChannel.get, { key });
}
