import type { BrowserWindowConstructorOptions } from 'electron';
import type { Customize } from '../types';
import { app, ipcMain, shell } from 'electron';
import { resolve } from 'path';
import { logError } from './log';
import { shortcutInstance } from './shortcut';
import { windowInstance } from './window';
import { AppChannel } from '../preload/channel';

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
          if (main.isMinimized()) main.restore();
          main.show();
          main.focus();
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
      win && windowInstance.load(win).catch(logError);
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
 * appReday之前监听
 * 监听渲染进程&子进程崩溃
 */
export const appErrorOn = () => {
  // 渲染进程崩溃监听
  app.on('render-process-gone', (event, webContents, details) =>
    logError(
      '[render-process-gone]',
      webContents.getTitle(),
      webContents.getURL(),
      JSON.stringify(details)
    )
  );
  // 子进程崩溃监听
  app.on('child-process-gone', (event, details) =>
    logError('[child-process-gone]', JSON.stringify(details))
  );
};

/**
 * appReday之后监听
 * @param options
 */
export const appAfterOn = () => {
  // 获得焦点时发出
  app.on('browser-window-focus', () => {
    // 关闭刷新
    shortcutInstance.register({
      name: '关闭刷新',
      key: 'CommandOrControl+R',
      callback: () => {}
    });
  });
  // 失去焦点时发出
  app.on('browser-window-blur', () => {
    // 注销关闭刷新
    shortcutInstance.unregister('CommandOrControl+R');
  });
  //app常用信息
  ipcMain.handle(AppChannel.getInfo, (event, args) => {
    return {
      name: app.name,
      version: app.getVersion()
    };
  });
  //app常用获取路径
  ipcMain.handle(AppChannel.getPath, (event, args) => {
    return app.getPath(args);
  });
  //app打开外部url
  ipcMain.handle(AppChannel.openUrl, async (event, args) => {
    return await shell.openExternal(args);
  });
  //app退出
  ipcMain.on(AppChannel.quit, (event, args) => {
    app.quit();
  });
  //app重启
  ipcMain.on(AppChannel.relaunch, (event, args) => {
    app.relaunch({ args: process.argv.slice(1) });
    if (args) app.exit(0);
  });
};
