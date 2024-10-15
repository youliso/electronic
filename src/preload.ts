import type { IpcMainInvokeEvent } from 'electron';

interface ProtocolHeader {
  channel: string;
  args: any;
}

type MainHandler<T = any> = (event: IpcMainInvokeEvent, args: T) => T | Promise<T> | void;

type BridgeHandler<T = any> = (args: T) => Promise<T> | void;

type RenderHandler<T = any> = (args: T) => void;

export interface PreloadInterfaceConfig {
  key: string;
}

class PreloadInterface {
  private static instance: PreloadInterface;
  private browserWindow: typeof Electron.BrowserWindow | undefined;
  private webContents: typeof Electron.WebContents | undefined;
  private type: 'main' | 'preload' | 'render' | undefined;
  private listeners: Map<string, { once: boolean; handler: MainHandler | RenderHandler }[]> =
    new Map();
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
      let funcs: MainHandler[] = [];
      handlers.forEach(({ once, handler }) => {
        funcs.push(handler as MainHandler);
        once && this.listeners.delete(channel);
      });
      return funcs;
    }
    return;
  }

  private routeHandlerByBridge(channel: string) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      let funcs: BridgeHandler[] = [];
      handlers.forEach(({ once, handler }) => {
        funcs.push(handler as BridgeHandler);
        once && this.listeners.delete(channel);
      });
      return funcs;
    }
    return;
  }

  private routeHandlerByRender(channel: string, message: any) {
    const handlers = this.listeners.get(channel);
    if (handlers) {
      handlers.forEach(({ once, handler }) => {
        (handler as RenderHandler)(message);
        once && this.listeners.delete(channel);
      });
    }
  }

  private onHandler(channel: string, handler: MainHandler | BridgeHandler | RenderHandler): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: false, handler });
  }

  private onceHandler(channel: string, handler: MainHandler | BridgeHandler | RenderHandler): void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, []);
    }
    this.listeners.get(channel)!.push({ once: true, handler });
  }

  private removeOnHandler(
    channel: string,
    handler?: MainHandler | BridgeHandler | RenderHandler
  ): void {
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
  main(
    browserWindow: typeof Electron.BrowserWindow,
    ipcMain: Electron.IpcMain,
    webContents?: typeof Electron.WebContents,
    config?: PreloadInterfaceConfig
  ) {
    this.browserWindow = browserWindow;
    this.webContents = webContents;
    if (config) this.config = Object.assign(this.config, config);
    ipcMain.handle(`${this.config.key}:invoke`, async (event, args: ProtocolHeader) => {
      const funcs = this.routeHandlerByMain(args.channel);
      if (funcs) {
        if (funcs.length == 1) {
          return await funcs[0](event, args.args);
        }
        let values: any[] = [];
        for (let index = 0; index < funcs.length; index++) {
          const value = await funcs[index](event, args.args);
          value && values.push(value);
        }
        if (values.length > 0) return values;
      }
    });
  }

  /**
   * 预载初始化
   */
  preload(
    contextBridge: Electron.ContextBridge,
    ipcRenderer: Electron.IpcRenderer,
    config?: PreloadInterfaceConfig
  ) {
    if (config) this.config = Object.assign(this.config, config);
    contextBridge.exposeInMainWorld(this.config.key, {
      bridge: async (channel: string, args: any) => {
        const funcs = this.routeHandlerByBridge(channel);
        if (funcs) {
          if (funcs.length == 1) {
            return await funcs[0](args);
          }
          let values: any[] = [];
          for (let index = 0; index < funcs.length; index++) {
            const value = await funcs[index](args);
            value && values.push(value);
          }
          if (values.length > 0) return values;
        }
      },
      invoke: (args: any) => {
        return ipcRenderer.invoke(`${this.config.key}:invoke`, args);
      },
      on: (listener: RenderHandler) =>
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
      this.routeHandlerByRender(args.channel, args.args)
    );
  }

  removeOn(channel: string, listener?: MainHandler | BridgeHandler | RenderHandler) {
    this.removeOnHandler(channel, listener);
  }

  handle<T = any>(channel: string, listener: MainHandler<T>) {
    if (this.type !== 'main') {
      throw new Error('only available in main process');
    }
    this.onHandler(channel, listener);
  }

  handleOnce<T = any>(channel: string, listener: MainHandler<T>) {
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
      this.browserWindow.getAllWindows().forEach((win) => win.webContents.send(key, value));
    }
  }

  sendByWebContents<T = any>(channel: string, args?: T, ids?: number[]) {
    if (this.type !== 'main') {
      throw new Error('only available in main process');
    }
    if (!this.webContents) {
      throw new Error('webContents is undefined');
    }
    const key = `${this.config.key}:on`;
    const value = { channel, args };
    if (ids) {
      ids.forEach((id) => this.webContents!.fromId(id)?.send(key, value));
    } else {
      this.webContents.getAllWebContents().forEach((webContent) => webContent.send(key, value));
    }
  }

  listen<T = any>(channel: string, listener: BridgeHandler<T>) {
    if (this.type !== 'preload') {
      throw new Error('only available in preload process');
    }
    this.onHandler(channel, listener);
  }

  listenOnce<T = any>(channel: string, listener: BridgeHandler<T>) {
    if (this.type !== 'preload') {
      throw new Error('only available in preload process');
    }
    this.onceHandler(channel, listener);
  }

  on<T = any>(channel: string, listener: RenderHandler<T>) {
    if (this.type !== 'render') {
      throw new Error('only available in render process');
    }
    this.onHandler(channel, listener);
  }

  once<T = any>(channel: string, listener: RenderHandler<T>) {
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

  bridge<R = any, T = any>(channel: string, args?: T): Promise<R> {
    if (this.type !== 'render') {
      throw new Error('only available in render process');
    }
    //@ts-ignore
    return window[this.config.key].bridge({
      channel,
      args
    } satisfies ProtocolHeader);
  }
}

export default PreloadInterface.getInstance();
