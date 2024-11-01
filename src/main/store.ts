import { readFileSync } from 'node:fs';
import { StoreChannel } from '../channel';
import { preload } from '../preload/main';

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
  use(conf: Config[]) {
    for (let index = 0; index < conf.length; index++) {
      const c = conf[index];
      try {
        const data = readFileSync(c.path, { encoding: 'utf-8' });
        this.set(c.seat, c.parse ? JSON.parse(data) : data);
      } catch (error) {
        throw error;
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
    preload.handle<{ key: string; value: any }>(StoreChannel.set, (event, args) => {
      if (args) {
        this.set(args.key, args.value);
      }
    });
    //获取(sharedObject)
    preload.handle<{ key: string }>(StoreChannel.get, (event, args) => {
      if (args) {
        return this.get(args.key);
      }
      return;
    });
  }
}

export const storeInstance = Store.getInstance();
