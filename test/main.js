const { appInstance, windowInstance, logError } = require("../dist/main");
const { join } = require("path");

appInstance
  .start()
  .then(() => {
    windowInstance.loadUrl = join(__dirname, "../test/index.html");

    // 调试模式
    // if (!app.isPackaged) {
    //   try {
    //     import('fs').then(({ readFileSync }) => {
    //       import('path').then(({ join }) => {
    //         windowInstance.loadUrl = `http://localhost:${readFileSync(join('.port'), 'utf8')}`;
    //         windowInstance.create(customize, opt);
    //       });
    //     });
    //   } catch (e) {
    //     throw 'not found .port';
    //   }
    // } else windowInstance.create(customize, opt);

    windowInstance.create(
      {
        title: "electron-template",
        route: "/",
        headNative: true,
      },
      {
        width: 800,
        height: 600,
        frame: true,
        show: false,
        webPreferences: {
          preload: join(__dirname, "../test/preload.js"),
        },
      }
    );
  })
  .catch(logError);
