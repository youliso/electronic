const { appInstance, windowInstance, logError } = require("../dist/main");
const { join } = require("path");

appInstance
  .start()
  .then(() => {
    windowInstance.loadUrl = join(__dirname, "../test/index.html");

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
