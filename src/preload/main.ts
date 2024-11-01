import { BrowserWindow, ipcMain, webContents, type IpcMainInvokeEvent } from 'electron';
import { PreloadInterface, PreloadInterfaceConfig, ProtocolHeader } from './common';

type MainHandler<T = any> = (event: IpcMainInvokeEvent, args: T) => T | Promise<T> | void;

class MainPreloadInterface extends PreloadInterface {
  private static instance: MainPreloadInterface;
  private config: PreloadInterfaceConfig = super.defaultCfg;

  static getInstance() {
    if (!MainPreloadInterface.instance) MainPreloadInterface.instance = new MainPreloadInterface();
    return MainPreloadInterface.instance;
  }
  constructor() {
    super();
  }

  initialize(config?: PreloadInterfaceConfig) {
    if (config) {
      this.config = Object.assign(this.config, config);
    }
    ipcMain.handle(`${this.config.key}:invoke`, async (event, args: ProtocolHeader) => {
      const funcs = super.routeHandler(args.channel);
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
      } else {
        console.warn(`${args.channel} Unbound callback function`);
      }
    });
  }

  handle<T = any>(channel: string, listener: MainHandler<T>) {
    super.on(channel, listener);
  }

  handleOnce<T = any>(channel: string, listener: MainHandler<T>) {
    super.once(channel, listener);
  }

  send<T = any>(channel: string, args?: T, ids?: number[]) {
    const key = `${this.config.key}:on`;
    const value = { channel, args };
    if (ids) {
      ids.forEach((id) => BrowserWindow.fromId(id)?.webContents.send(key, value));
    } else {
      BrowserWindow.getAllWindows().forEach((win) => win.webContents.send(key, value));
    }
  }

  sendByWebContents<T = any>(channel: string, args?: T, ids?: number[]) {
    const key = `${this.config.key}:on`;
    const value = { channel, args };
    if (ids) {
      ids.forEach((id) => webContents.fromId(id)?.send(key, value));
    } else {
      webContents.getAllWebContents().forEach((webContent) => webContent.send(key, value));
    }
  }
}

export const preload = MainPreloadInterface.getInstance();
