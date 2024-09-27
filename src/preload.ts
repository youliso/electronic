import type {
  BrowserWindow,
  ContextBridge,
  IpcMain,
  IpcMainInvokeEvent,
  IpcRenderer,
  WebContents
} from 'electron';

interface ProtocolHeader {
  channel: string;
  args: any;
}

interface ManiProtocolHeader<T = any> {
  event: IpcMainInvokeEvent;
  args: T;
}

type Handler = (args?: any) => any | Promise<any>;

export interface PreloadInterfaceConfig {
  key: string;
}

class PreloadInterface {
  private static instance: PreloadInterface;
  private browserWindow: typeof BrowserWindow | undefined;
  private type: 'main' | 'preload' | 'render' | undefined;
  private listeners: Map<string, { once: boolean; handler: Handler }[]> = new Map();
  private config: PreloadInterfaceConfig = {
    key: 'process-communication'
  };

  static getInstance() {
    if (!PreloadInterface.instance) PreloadInterface.instance = new PreloadInterface();
    return PreloadInterface.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      if (typeof process !== 'undefined' && process.contextIsolated) {
        this.type = 'preload';
      } else {
        this.type = 'render';
      }
    } else if (process.type === 'browser') {
      this.type = 'main';
    }
  }

  private routeHandlerByMain(channel: string) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      let funcs: Handler[] = [];
      handlers.forEach(({ once, handler }) => {
        funcs.push(handler);
        once && this.listeners.delete(channel);
      });
      return funcs;
    }
    return;
  }

  private routeHandler(channel: string, message: any) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      handlers.forEach(({ once, handler }) => {
        handler(message);
        once && this.listeners.delete(channel);
      });
    }
  }

  private onHandler(channel: string, handler: Handler): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: false, handler });
  }

  private onceHandler(channel: string, handler: Handler): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: true, handler });
  }

  private removeOnHandler(channel: string, handler?: Handler): void {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      if (handler) {
        const index = handlers.findIndex((e) => e.handler == handler);
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

  /**
   * 主进程初始化
   */
  main(browserWindow: typeof BrowserWindow, ipcMain: IpcMain, config?: PreloadInterfaceConfig) {
    this.browserWindow = browserWindow;
    if (config) this.config = Object.assign(this.config, config);
    ipcMain.handle(`${this.config.key}:invoke`, async (event, args: ProtocolHeader) => {
      const params = {
        event,
        args: args.args
      };
      const funcs = this.routeHandlerByMain(args.channel);
      if (funcs) {
        if (funcs.length == 1) {
          return await funcs[0](params);
        }
        let values: any[] = [];
        for (let index = 0; index < funcs.length; index++) {
          const value = await funcs[index](params);
          value && values.push(value);
        }
        if (values.length > 0) return values;
      }
    });
  }

  /**
   * 预载初始化
   */
  preload(contextBridge: ContextBridge, ipcRenderer: IpcRenderer, config?: PreloadInterfaceConfig) {
    if (config) this.config = Object.assign(this.config, config);
    contextBridge.exposeInMainWorld(this.config.key, {
      invoke: (args: any) => {
        return ipcRenderer.invoke(`${this.config.key}:invoke`, args);
      },
      on: (listener: (args: any) => void) =>
        ipcRenderer.on(`${this.config.key}:on`, (_, args) => listener(args))
    });
  }

  /**
   * 渲染进程初始化
   */
  render(config?: PreloadInterfaceConfig) {
    if (config) this.config = Object.assign(this.config, config);
    // @ts-ignore
    window[this.config.key].on((args: ProtocolHeader) =>
      this.routeHandler(args.channel, args.args)
    );
  }

  removeOn(channel: string, listener?: Handler) {
    this.removeOnHandler(channel, listener);
  }

  handle<T = any>(channel: string, listener: (args: ManiProtocolHeader<T>) => void) {
    if (this.type !== 'main') {
      throw new Error('only available in main process');
    }
    this.onHandler(channel, listener);
  }

  handleOnce<T = any>(channel: string, listener: (args: ManiProtocolHeader<T>) => void) {
    if (this.type !== 'main') {
      throw new Error('only available in main process');
    }
    this.onceHandler(channel, listener);
  }

  send<T = any>(channel: string, args?: T, ids?: number[]) {
    if (this.type !== 'main') {
      throw new Error('only available in main process');
    }
    if (!this.browserWindow) {
      throw new Error('browserWindow is undefined');
    }
    const key = `${this.config.key}:on`;
    const value = { channel, args };
    if (ids) {
      ids.forEach((id) => this.browserWindow!.fromId(id)?.webContents.send(key, value));
    } else {
      const wins = this.browserWindow!.getAllWindows();
      wins.forEach((win) => win.webContents.send(key, value));
    }
  }

  on<T = any>(channel: string, listener: (args: T) => void) {
    if (this.type !== 'render') {
      throw new Error('only available in render process');
    }
    this.onHandler(channel, listener);
  }

  once<T = any>(channel: string, listener: (args: T) => void) {
    if (this.type !== 'render') {
      throw new Error('only available in render process');
    }
    this.onceHandler(channel, listener);
  }

  invoke<R = any, T = any>(channel: string, args?: T): Promise<R> {
    if (this.type !== 'render') {
      throw new Error('only available in render process');
    }
    //@ts-ignore
    return window[this.config.key].invoke({
      channel,
      args
    } satisfies ProtocolHeader);
  }
}

export default PreloadInterface.getInstance();
