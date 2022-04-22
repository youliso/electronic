declare global {
  module Electron {
    interface BrowserWindow {
      customize: import("./types").Customize;
    }

    interface BrowserWindowConstructorOptions {
      customize?: import("./types").Customize;
    }
  }
}

export * from "./mod/app";
export * from "./mod/file";
export * from "./mod/global";
export * from "./mod/log";
export * from "./mod/path";
export * from "./mod/session";
export * from "./mod/shortcut";
export * from "./mod/tray";
export * from "./mod/update";
export * from "./mod/window";
