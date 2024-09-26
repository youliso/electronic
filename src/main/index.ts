import { ipcMain } from 'electron';
import preload from '../preload';
export * from './app';
export * from './store';
export * from './machine';
export * from './shortcut';
export * from './window';

preload.main(ipcMain);
