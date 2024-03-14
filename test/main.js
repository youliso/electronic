const { join } = require('path');
const { app } = require('electron');
const {
  appSingleInstanceLock,
  appErrorOn,
  appAfterOn,
  windowInstance,
  logError
} = require('../dist/main');

// 设置窗口管理默认参数
windowInstance.setDefaultCfg({
  defaultLoadType: 'file',
  defaultUrl: join(__dirname, '../test/index.html'),
  defaultPreload: join(__dirname, '../test/preload.js')
});

// 初始渲染进程参数
let customize = {
  title: 'electron-template',
  route: '/'
};

// 初始窗口参数
let browserWindowOptions = {
  width: 800,
  height: 600,
  webPreferences: {
    devTools: true
  }
};

// 崩溃监听
appErrorOn();

// 单例锁定
appSingleInstanceLock({
  isFocusMainWin: false,
  customize,
  browserWindowOptions
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app
  .whenReady()
  .then(() => {
    app.on('activate', () => {
      if (windowInstance.getAll().length === 0) {
        const win = windowInstance.create(
          windowInstance.defaultCustomize,
          windowInstance.defaultBrowserWindowOptions
        );
        win && windowInstance.load(win).catch(logError);
      }
    });

    // 基础模块监听
    appAfterOn();

    // 窗口模块监听
    windowInstance.on();

    // 创建窗口
    const win = windowInstance.create(customize, browserWindowOptions);
    win && windowInstance.load(win, { openDevTools: true }).catch(logError);
  })
  .catch(logError);
