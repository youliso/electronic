import type { Accelerator } from '../types';
import { globalShortcut } from 'electron';
import { deepCopy } from './utils';
import { ShortcutChannel } from '../channel';
import preload from '../preload';

export class Shortcut {
  private static instance: Shortcut;

  private data: Accelerator[] = [];

  static getInstance() {
    if (!Shortcut.instance) Shortcut.instance = new Shortcut();
    return Shortcut.instance;
  }

  constructor() {}

  /**
   * 添加已注册快捷键
   * @param accelerator
   */
  private set(accelerator: Accelerator) {
    this.data.push(accelerator);
  }

  /**
   * 获取已注册快捷键
   * @param key
   */
  get(key: string) {
    for (let i = 0, len = this.data.length; i < len; i++) {
      const accelerator = this.data[i];
      if (
        (typeof accelerator.key === 'string' && accelerator.key === key) ||
        (Array.isArray(accelerator.key) && accelerator.key.indexOf(key) > -1)
      ) {
        return deepCopy<Accelerator>(accelerator);
      }
    }
    return null;
  }

  /**
   * 获取全部已注册快捷键
   */
  getAll() {
    return deepCopy<Accelerator[]>(this.data);
  }

  /**
   * 删除已注册快捷键
   * @param key
   */
  private del(key: string) {
    for (let i = 0, len = this.data.length; i < len; i++) {
      const accelerator = this.data[i];
      if (typeof accelerator.key === 'string' && accelerator.key === key) {
        this.data.splice(i, 1);
        break;
      }
      if (Array.isArray(accelerator.key)) {
        const index = accelerator.key.indexOf(key);
        if (index > -1) {
          accelerator.key.splice(index, 1);
          break;
        }
      }
    }
  }

  /**
   * 清空已注册快捷键
   */
  private delAll() {
    // @ts-ignore
    delete this.data;
    this.data = [];
  }

  /**
   * 注册快捷键 (重复注册将覆盖)
   * @param accelerator
   */
  register(accelerator: Accelerator) {
    this.unregister(accelerator.key);
    if (typeof accelerator.key === 'string')
      globalShortcut.register(accelerator.key, accelerator.callback || (() => void 0));
    else globalShortcut.registerAll(accelerator.key, accelerator.callback || (() => void 0));
    this.set(accelerator);
  }

  /**
   * 清除快捷键
   */
  unregister(key: string | string[]) {
    if (typeof key === 'string') {
      globalShortcut.unregister(key);
      this.del(key);
      return;
    }
    key.forEach((e) => {
      globalShortcut.unregister(e);
      this.del(e);
    });
  }

  /**
   * 清空全部快捷键
   */
  unregisterAll() {
    globalShortcut.unregisterAll();
    this.delAll();
  }

  /**
   * 监听
   */
  on() {
    preload.handle<{ name: string; key: string | string[] }>(
      ShortcutChannel.register,
      (_, args) => {
        if (args) {
          const accelerator: Accelerator = {
            ...args,
            callback: () => preload.send(`shortcut-back`, args.key)
          };
          return this.register(accelerator);
        }
        return;
      }
    );
    preload.handle(ShortcutChannel.unregister, (_, args) =>
      args ? this.unregister(args) : this.unregisterAll()
    );
    preload.handle(ShortcutChannel.get, (_, args) => {
      if (args) {
        const accelerator = { ...this.get(args) };
        delete accelerator.callback;
        return accelerator;
      }
      const acceleratorAll = this.getAll();
      // @ts-ignore
      acceleratorAll.map((e) => delete e.callback);
      return acceleratorAll;
    });
  }
}

export const shortcutInstance = Shortcut.getInstance();
