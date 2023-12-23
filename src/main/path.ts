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
  ipcMain.handle(PathChannel.sep, async (event) => sep());
  ipcMain.handle(PathChannel.isAbsolute, async (event, args) => isAbsolute(args));
  ipcMain.handle(PathChannel.dirname, async (event, args) => dirname(args));
  ipcMain.handle(PathChannel.normalize, async (event, args) => normalize(args));
  ipcMain.handle(PathChannel.basename, async (event, args) => basename(args));
}
