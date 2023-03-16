const { join } = require('path');
const { appInstance, windowInstance, logError } = require('../dist');

appInstance
  .start()
  .then(() => {
    // // 调试模式;
    // if (!app.isPackaged) {
    //   try {
    //     import("fs").then(({ readFileSync }) => {
    //       import("path").then(({ join }) => {
    //         windowInstance.defaultUrl = `http://localhost:${readFileSync(
    //           join(".port"),
    //           "utf8"
    //         )}`;
    //         windowInstance.create(customize, opt);
    //       });
    //     });
    //   } catch (e) {
    //     throw "not found .port";
    //   }
    // } else windowInstance.create(customize, opt);

    windowInstance.setDefaultCfg({
      defaultUrl: join(__dirname, '../test/index.html'),
      defaultPreload: join(__dirname, '../test/preload.js')
    });

    const win = windowInstance.create(
      {
        title: 'electron-template',
        route: '/',
        headNative: true
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
