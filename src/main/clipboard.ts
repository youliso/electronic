import { clipboard, ipcMain } from 'electron';
import { ClipboardChannel } from '../preload/channel';

export function clipboardOn() {
  ipcMain.handle(ClipboardChannel.readText, async (_, args) => {
    return clipboard.readText(args.type);
  });
  ipcMain.handle(ClipboardChannel.writeText, async (_, args) => {
    return clipboard.writeText(args.text);
  });
}
