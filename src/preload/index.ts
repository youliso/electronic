import { contextBridge, ipcRenderer } from 'electron';
import { PreloadInterface, PreloadInterfaceConfig } from './common';

type BridgeHandler<T = any> = (args: T) => T | Promise<T> | void;

class BridgePreloadInterface extends PreloadInterface {
  private static instance: BridgePreloadInterface;
  private config: PreloadInterfaceConfig = super.defaultCfg;

  static getInstance() {
    if (!BridgePreloadInterface.instance)
      BridgePreloadInterface.instance = new BridgePreloadInterface();
    return BridgePreloadInterface.instance;
  }
  constructor() {
    super();
  }

  initialize(config?: PreloadInterfaceConfig) {
    if (config) {
      this.config = Object.assign(this.config, config);
    }
    contextBridge.exposeInMainWorld(this.config.key, {
      bridge: async (channel: string, args: any) => {
        const values = await super.routeHandler(channel, args);
        if (values && values.length > 0) {
          return values.length == 1 ? values[0] : values;
        }
        console.warn(`${args.channel} Unbound callback function`);
        return;
      },
      send: (args: any) =>
        ipcRenderer.send(`${this.config.key}:send`, args)
      ,
      invoke: (args: any) =>
        ipcRenderer.invoke(`${this.config.key}:invoke`, args)
      ,
      on: (listener: (args: any) => void) =>
        ipcRenderer.on(`${this.config.key}:on`, (_, args) => listener(args))
    });
  }

  on<T = any>(channel: string, listener: BridgeHandler<T>) {
    super.on(channel, listener);
  }

  once<T = any>(channel: string, listener: BridgeHandler<T>) {
    super.once(channel, listener);
  }
}

export const preload = BridgePreloadInterface.getInstance();
