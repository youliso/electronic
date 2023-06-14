import path from 'path';
import { ipcMain } from 'electron';

export function sep() {
  return path.sep;
}

export function isAbsolute(str: string) {
  return path.isAbsolute(str);
}

export function dirname(str: string) {
  return path.dirname(str);
}

export function normalize(str: string) {
  return path.normalize(str);
}

export function basename(str: string) {
  return path.basename(str);
}

export function pathOn() {
  ipcMain.handle('path-sep', async (event) => sep());
  ipcMain.handle('path-isAbsolute', async (event, args) => isAbsolute(args));
  ipcMain.handle('path-dirname', async (event, args) => dirname(args));
  ipcMain.handle('path-normalize', async (event, args) => normalize(args));
  ipcMain.handle('path-basename', async (event, args) => basename(args));
}
