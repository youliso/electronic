import type { BrowserWindowConstructorOptions } from 'electron';
import type { Customize } from '../types/index';
import { app, shell } from 'electron';
import { resolve } from 'path';
import { windowInstance } from './window';
import { AppChannel } from '../types/channel';
import preload from '../preload';

export interface AppBeforeOptions {
  /**
   * 包含要发送到第一实例的附加数据的 JSON 对象
   */
  additionalData?: any;
  /**
   * 后续实例启动时是否聚焦到第一实例
   */
  isFocusMainWin?: boolean;

  /**
   * isFocusMainWin为否时需穿如新窗口参数
   */
  customize?: Customize;

  /**
   * isFocusMainWin为否时需穿如新窗口参数
   */
  browserWindowOptions?: BrowserWindowConstructorOptions;
}

/**
 * appReday之前监听
 * 单例锁定
 * @param options
 */
export const appSingleInstanceLock = (options: AppBeforeOptions) => {
  // 默认单例根据自己需要改
  if (!app.requestSingleInstanceLock(options?.additionalData)) app.quit();
  else {
    app.on('second-instance', (event, argv) => {
      //是否多窗口聚焦到第一实例
      if (options?.isFocusMainWin) {
        const main = windowInstance.getMain();
        if (main) {
          preload.send('window-single-instance', argv, [main.id]);
        }
        return;
      }
      if (!options?.customize || !options?.browserWindowOptions) {
        throw new Error('not [second-instance] options?customize || options?.browserWindowOptions');
      }
      const win = windowInstance.create(
        {
          ...options.customize,
          argv
        },
        options.browserWindowOptions
      );
      win && windowInstance.load(win);
    });
  }
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
