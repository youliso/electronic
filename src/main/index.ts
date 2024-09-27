import { ipcMain } from 'electron';
import preload, { type PreloadInterfaceConfig } from '../preload';
export * from './app';
export * from './store';
export * from './machine';
export * from './shortcut';
export * from './window';

export const init = (config?: PreloadInterfaceConfig) => {
  preload.main(ipcMain, config);
};
