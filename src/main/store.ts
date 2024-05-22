import { ipcMain } from 'electron';
import { logError } from './log';
import { readFile } from './file';
import { StoreChannel } from '../preload/channel';

type Obj<Value> = {} & {
  [key: string]: Value | Obj<Value>;
};

export interface Config {
  path: string;
  seat: string;
  parse: boolean;
  opt?: { encoding?: BufferEncoding; flag?: string };
}

export class Store {
  private static instance: Store;

  public sharedObject: { [key: string]: any } = {};

  static getInstance() {
    if (!Store.instance) Store.instance = new Store();
    return Store.instance;
  }

  constructor() {}

  /**
   * 挂载配置
   * @param path 配置文件路径
   * @param seat 存放位置
   * @param parse 是否parse
   * @param opt
   */
  async use(conf: Config | Config[]) {
    if (Array.isArray(conf)) {
      for (let index = 0; index < conf.length; index++) {
        const c = conf[index];
        try {
          const cfg = (await readFile(c.path, c.opt || { encoding: 'utf-8' })) as any;
          if (cfg) this.set(c.seat, c.parse ? JSON.parse(cfg) : cfg);
        } catch (e) {
          logError(`[cfg ${c.path}]`, e);
        }
      }
    } else {
      try {
        const cfg = (await readFile(conf.path, conf.opt || { encoding: 'utf-8' })) as any;
        if (cfg) this.set(conf.seat, conf.parse ? JSON.parse(cfg) : cfg);
      } catch (e) {
        logError(`[cfg ${conf.path}]`, e);
      }
    }
  }

  get<Value>(key: string): Value | undefined {
    if (key === '') {
      console.error('Invalid key, the key can not be a empty string');
      return;
    }

    if (!key.includes('.') && Object.prototype.hasOwnProperty.call(this.sharedObject, key)) {
      return this.sharedObject[key] as Value;
    }

    const levels = key.split('.');
    let cur = this.sharedObject;
    for (const level of levels) {
      if (Object.prototype.hasOwnProperty.call(cur, level)) {
        cur = cur[level] as unknown as Obj<Value>;
      } else {
        return;
      }
    }

    return cur as unknown as Value;
  }

  set<Value>(key: string, value: Value, exists: boolean = false): void {
    if (key === '') {
      console.error('Invalid key, the key can not be a empty string');
      return;
    }

    if (!key.includes('.')) {
      if (Object.prototype.hasOwnProperty.call(this.sharedObject, key) && exists) {
        console.warn(`The key ${key} looks like already exists on obj.`);
      }
      this.sharedObject[key] = value;
    }

    const levels = key.split('.');
    const lastKey = levels.pop()!;

    let cur = this.sharedObject;
    for (const level of levels) {
      if (Object.prototype.hasOwnProperty.call(cur, level)) {
        cur = cur[level];
      } else {
        console.error(`Cannot set value because the key ${key} is not exists on obj.`);
        return;
      }
    }

    if (typeof cur !== 'object') {
      console.error(`Invalid key ${key} because the value of this key is not a object.`);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(cur, lastKey) && exists) {
      console.warn(`The key ${key} looks like already exists on obj.`);
    }
    cur[lastKey] = value;
  }

  /**
   * 开启监听
   */
  on() {
    //赋值(sharedObject)
    ipcMain.handle(StoreChannel.set, (event, { key, value }) => {
      return this.set(key, value);
    });
    //获取(sharedObject)
    ipcMain.handle(StoreChannel.get, (event, { key }) => {
      return this.get(key);
    });
  }
}

export const storeInstance = Store.getInstance();
