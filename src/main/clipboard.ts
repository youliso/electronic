import { clipboard, ipcMain } from 'electron';

export function clipboardOn() {
  ipcMain.handle('app-clipboard-read-text', async (event, args) => {
    return clipboard.readText(args.type);
  });
  ipcMain.handle('app-clipboard-write-text', async (event, args) => {
    return clipboard.writeText(args.text);
  });
}
