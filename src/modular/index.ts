declare global {
  module Electron {
    interface BrowserWindow {
      customize: import('../types').Customize;
    }

    interface BrowserWindowConstructorOptions {
      customize?: import('../types').Customize;
    }
  }
}

export * from './app';
export * from './file';
export * from './global';
export * from './log';
export * from './path';
export * from './session';
export * from './shortcut';
export * from './tray';
export * from './update';
export * from './window';
