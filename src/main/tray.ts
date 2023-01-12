import type { MenuItemConstructorOptions, MenuItem } from 'electron';
import { app, Menu, Tray, nativeImage } from 'electron';
import { windowInstance } from './window';

export interface TrayOptions {
  name: string;
  iconPath: string,
  menuTemplate: Array<(MenuItemConstructorOptions) | (MenuItem)>
}

export function getMenuTemplate(items: Array<(MenuItemConstructorOptions) | (MenuItem)>) {
  return Menu.buildFromTemplate(items || [
    {
      label: '显示',
      click: () => windowInstance.func('show')
    },
    {
      label: '退出',
      click: () => app.quit()
    }
  ]);
}

export function createTray(opt: TrayOptions) {
  const tray = new Tray(nativeImage.createFromDataURL(opt.iconPath));
  tray.setContextMenu(getMenuTemplate(opt.menuTemplate));
  tray.setToolTip(opt.name);
  return tray;
}
