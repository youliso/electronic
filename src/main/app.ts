import { app, shell } from 'electron';
import { resolve } from 'path';
import { AppChannel } from '../types/channel';
import preload from '../preload';

export interface AppBeforeOptions {
  /**
   * 包含要发送到第一实例的附加数据的 JSON 对象
   */
  additionalData?: any;
  secondInstanceFunc?: (
    event: Electron.Event,
    argv: string[],
    workingDirectory: string,
    additionalData: unknown
  ) => void;
}

/**
 * appReday之前监听
 * 实例锁设定
 * @param options
 */
export const appSingleInstanceLock = (options: AppBeforeOptions) => {
  // 默认单例根据自己需要改
  if (!app.requestSingleInstanceLock(options?.additionalData)) app.quit();
  else if (options.secondInstanceFunc) app.on('second-instance', options.secondInstanceFunc);
};

/**
 * 协议注册 (需appReday之前)
 * @param appName 协议名称(默认应用名称)
 */
export const appProtocolRegister = (appName?: string) => {
  let argv = [];
  if (!app.isPackaged) argv.push(resolve(process.argv[1]));
  argv.push('--');
  if (!app.isDefaultProtocolClient(appName || app.name, process.execPath, argv))
    app.setAsDefaultProtocolClient(appName || app.name, process.execPath, argv);
};

/**
 * appReday之后监听
 * @param options
 */
export const appAfterOn = () => {
  //app常用信息
  preload.handle(AppChannel.getInfo, () => {
    return {
      name: app.name,
      version: app.getVersion()
    };
  });
  //app常用获取路径
  preload.handle(AppChannel.getPath, (_, args) => {
    return app.getPath(args);
  });
  //app打开外部url
  preload.handle(AppChannel.openUrl, async (_, args) => {
    return await shell.openExternal(args);
  });
  //app退出
  preload.handle(AppChannel.quit, () => {
    app.quit();
  });
  //app重启
  preload.handle(AppChannel.relaunch, (_, args) => {
    app.relaunch({ args: process.argv.slice(1) });
    if (args) app.exit(0);
  });
};
