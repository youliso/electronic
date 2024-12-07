export interface ProtocolHeader {
  channel: string;
  args: any;
}

export interface PreloadInterfaceConfig {
  key: string;
}

export class PreloadInterface {
  private listeners: Map<string, Array<{ once: boolean; handler: (...args: any) => any | Promise<any>; } | undefined>> = new Map();
  private defaultConfig: PreloadInterfaceConfig = {
    key: 'process-communication'
  };

  constructor() { }

  get defaultCfg() {
    return this.defaultConfig;
  }

  async routeHandler(channel: string, args: any, event?: Electron.IpcMainInvokeEvent, back?: boolean) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      let values: any[] = [];
      for (let index = 0; index < handlers.length; index++) {
        const handler = handlers[index];
        if (handler) {
          let res: any = undefined;
          event ? (res = await handler.handler(event, args)) : (res = await handler.handler(args));
          back && values.push(res);
          handler.once && handlers.splice(index, 1);
        }
      }
      handlers.length === 0 && this.listeners.delete(channel);
      if (back) {
        return values;
      }
    } else {
      console.warn(`${channel} Unbound callback function`);
    }
    return;
  }

  on(channel: string, handler: any): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: false, handler });
  }

  once(channel: string, handler: any): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: true, handler });
  }

  removeOn(channel: string, handler?: any): void {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      if (handler) {
        const index = handlers.findIndex((e) => e && e.handler == handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.listeners.delete(channel);
        }
      } else {
        this.listeners.delete(channel);
      }
    }
  }
}
