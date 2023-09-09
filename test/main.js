const { join } = require('path');
const { app } = require('electron');
const { appBeforeOn, appOn, windowInstance, logError } = require('../dist/main');

// 设置窗口管理默认参数
windowInstance.setDefaultCfg({
  defaultUrl: join(__dirname, '../test/index.html'),
  defaultPreload: join(__dirname, '../test/preload.js')
});

appBeforeOn();

app
  .whenReady()
  .then(() => {
    // 基础模块监听
    appOn();
    windowInstance.on();
    // 创建窗口
    const win = windowInstance.create(
      {
        title: 'electron-template',
        loadType: 'file',
        route: '/'
      },
      {
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
          devTools: true
        }
      }
    );
    win && windowInstance.load(win, { openDevTools: true }).catch(logError);
  })
  .catch(logError);
