import { app, Menu, Tray as electronTray, nativeImage } from 'electron';
import { windowInstance } from './window';

export class Tray {
  public main: electronTray | undefined; //托盘

  constructor() {}

  /**
   * 创建托盘
   * */
  create(trayImgPath: string) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示',
        click: () => windowInstance.func('show')
      },
      {
        label: '退出',
        click: () => app.quit()
      }
    ]);
    this.main = new electronTray(nativeImage.createFromDataURL(trayImgPath));
    this.main.setContextMenu(contextMenu);
    this.main.setToolTip(app.name);
    this.main.on('click', () => windowInstance.func('show'));
  }

  /**
   * 监听
   */
  on() {}
}
