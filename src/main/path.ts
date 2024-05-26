import path from 'path';
import { ipcMain } from 'electron';
import { PathChannel } from '../preload/channel';

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
  ipcMain.handle(PathChannel.sep, async () => sep());
  ipcMain.handle(PathChannel.isAbsolute, async (_, args) => isAbsolute(args));
  ipcMain.handle(PathChannel.dirname, async (_, args) => dirname(args));
  ipcMain.handle(PathChannel.normalize, async (_, args) => normalize(args));
  ipcMain.handle(PathChannel.basename, async (_, args) => basename(args));
}
