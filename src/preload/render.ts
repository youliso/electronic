import { PreloadInterface, PreloadInterfaceConfig, ProtocolHeader } from './common';

type RenderHandler<T = any> = (args: T) => void;

class RenderPreloadInterface extends PreloadInterface {
  private static instance: RenderPreloadInterface;
  private config: PreloadInterfaceConfig = super.defaultCfg;

  static getInstance() {
    if (!RenderPreloadInterface.instance)
      RenderPreloadInterface.instance = new RenderPreloadInterface();
    return RenderPreloadInterface.instance;
  }
  constructor() {
    super();
  }

  initialize(config?: PreloadInterfaceConfig) {
    if (config) {
      this.config = Object.assign(this.config, config);
    }
    // @ts-ignore
    window[this.config.key].on((args: ProtocolHeader) =>
      super.routeHandlerByMsg(args.channel, args.args)
    );
  }

  on<T = any>(channel: string, listener: RenderHandler<T>) {
    super.on(channel, listener);
  }

  once<T = any>(channel: string, listener: RenderHandler<T>) {
    super.once(channel, listener);
  }

  invoke<R = any, T = any>(channel: string, args?: T): Promise<R> {
    //@ts-ignore
    return window[this.config.key].invoke({
      channel,
      args
    } satisfies ProtocolHeader);
  }

  bridge<R = any, T = any>(channel: string, args?: T): Promise<R> {
    //@ts-ignore
    return window[this.config.key].bridge(channel, args);
  }
}

export const preload = RenderPreloadInterface.getInstance();
