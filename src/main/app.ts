import type { Customize } from './types';
import { app, ipcMain, shell, nativeTheme } from 'electron';
import { resolve } from 'path';
import { fileOn } from './file';
import { pathOn } from './path';
import { machineOn } from './machine';
import { logOn, logError } from './log';
import { shortcutInstance } from './shortcut';
import { windowInstance } from './window';
import { globalInstance } from './global';

export class App {
  private static instance: App;

  //关闭硬件加速
  public isDisableHardwareAcceleration: boolean = false;
  // 当运行第二个实例时是否为创建窗口
  public isSecondInstanceWin: boolean = false;
  // 窗口配置
  public windowDefaultCustomize: Customize = {};
  // 窗口参数
  public windowDefaultOpt: Electron.BrowserWindowConstructorOptions = {};

  static getInstance() {
    if (!App.instance) App.instance = new App();
    return App.instance;
  }

  constructor() {
  }

  /**
   * 启动主进程
   */
  async start() {
    this.beforeOn();
    // 协议调起
    let argv = [];
    if (!app.isPackaged) argv.push(resolve(process.argv[1]));
    argv.push('--');
    if (!app.isDefaultProtocolClient(app.name, process.execPath, argv))
      app.setAsDefaultProtocolClient(app.name, process.execPath, argv);
    await app.whenReady().catch(logError);
    this.afterOn();
    this.modular();
  }

  /**
   * 必要模块
   */
  modular() {
    logOn();
    fileOn();
    pathOn();
    machineOn();
    globalInstance.on();
    shortcutInstance.on();
    windowInstance.on();
  }

  /**
   * 监听
   */
  beforeOn() {
    //关闭硬件加速
    this.isDisableHardwareAcceleration && app.disableHardwareAcceleration();
    // 默认单例根据自己需要改
    if (!app.requestSingleInstanceLock()) app.quit();
    else {
      app.on('second-instance', (event, argv) => {
        // 当运行第二个实例时是否为创建窗口
        if (!this.isSecondInstanceWin) {
          const main = windowInstance.getMain();
          if (main) {
            if (main.isMinimized()) main.restore();
            main.show();
            main.focus();
          }
          return;
        }
        windowInstance.create(
          {
            ...this.windowDefaultCustomize,
            argv
          },
          this.windowDefaultOpt
        );
      });
    }
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
    // 关闭所有窗口退出
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });
    nativeTheme.addListener('updated', () => {
      windowInstance.send('socket-back', {
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
        shouldUseHighContrastColors: nativeTheme.shouldUseHighContrastColors,
        shouldUseInvertedColorScheme: nativeTheme.shouldUseInvertedColorScheme
      });
    });
  }

  /**
   * 监听
   */
  afterOn() {
    // darwin
    app.on('activate', () => {
      if (windowInstance.getAll().length === 0)
        windowInstance.create(this.windowDefaultCustomize, this.windowDefaultOpt);
    });
    // 获得焦点时发出
    app.on('browser-window-focus', () => {
      // 关闭刷新
      shortcutInstance.register({
        name: '关闭刷新',
        key: 'CommandOrControl+R',
        callback: () => {
        }
      });
    });
    // 失去焦点时发出
    app.on('browser-window-blur', () => {
      // 注销关闭刷新
      shortcutInstance.unregister('CommandOrControl+R');
    });
    //app常用信息
    ipcMain.handle('app-info-get', (event, args) => {
      return {
        name: app.name,
        version: app.getVersion()
      };
    });
    //app常用获取路径
    ipcMain.handle('app-path-get', (event, args) => {
      return app.getPath(args);
    });
    //app打开外部url
    ipcMain.handle('app-open-url', async (event, args) => {
      return await shell.openExternal(args);
    });
    //app退出
    ipcMain.on('app-quit', (event, args) => {
      app.quit();
    });
    //app重启
    ipcMain.on('app-relaunch', (event, args) => {
      app.relaunch({ args: process.argv.slice(1) });
      if (args) app.exit(0);
    });
  }
}

export const appInstance = App.getInstance();
