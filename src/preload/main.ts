import { BrowserWindow, ipcMain, webContents } from 'electron';
import { PreloadInterface, PreloadInterfaceConfig, ProtocolHeader } from './common';

type MainHandler<T = any> = (event: Electron.IpcMainInvokeEvent, args: T) => T | Promise<T> | void;

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
      const values = await super.routeHandler(args.channel, args.args, event, true);
      if (values && values.length > 0) {
        return values.length == 1 ? values[0] : values;
      }
      console.warn(`${args.channel} Unbound callback function`);
      return;
    });
    ipcMain.on(`${this.config.key}:send`, (event, args: ProtocolHeader) => { super.routeHandler(args.channel, args.args, event) })
  }

  on<T = any>(channel: string, listener: MainHandler<T>) {
    super.on(channel, listener);
  }

  once<T = any>(channel: string, listener: MainHandler<T>) {
    super.once(channel, listener);
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