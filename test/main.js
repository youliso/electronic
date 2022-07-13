const { join } = require("path");
const { appInstance } = require("../dist/main/app");
const { windowInstance } = require("../dist/main/window");
const { Printer } = require("../dist/main/printer");
const { logError } = require("../dist/main/log");

appInstance
  .start()
  .then(() => {
    const printer = new Printer();

    printer.on();

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
      defaultUrl: join(__dirname, "../test/index.html"),
      defaultPreload: join(__dirname, "../test/preload.js"),
    });

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
      }
    );
  })
  .catch(logError);
