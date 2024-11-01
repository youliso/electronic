export interface ProtocolHeader {
  channel: string;
  args: any;
}

export interface PreloadInterfaceConfig {
  key: string;
}

export class PreloadInterface {
  private listeners: Map<string, Array<{ once: boolean; handler: any } | undefined>> = new Map();
  private defaultConfig: PreloadInterfaceConfig = {
    key: 'process-communication'
  };

  constructor() {}

  get defaultCfg() {
    return this.defaultConfig;
  }

  routeHandler(channel: string) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      let funcs: any[] = [];
      handlers.forEach((res, index) => {
        if (res) {
          funcs.push(res.handler);
          res.once && (handlers[index] = undefined);
        }
      });
      const newHandlers = handlers.filter((handler) => !!handler);
      newHandlers.length === 0
        ? this.listeners.delete(channel)
        : this.listeners.set(channel, newHandlers);
      return funcs;
    }
    return;
  }

  routeHandlerByMsg(channel: string, message: any) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      handlers.forEach((res, index) => {
        if (res) {
          res.handler(message);
          res.once && (handlers[index] = undefined);
        }
      });
      const newHandlers = handlers.filter((handler) => !!handler);
      newHandlers.length === 0
        ? this.listeners.delete(channel)
        : this.listeners.set(channel, newHandlers);
    }
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
