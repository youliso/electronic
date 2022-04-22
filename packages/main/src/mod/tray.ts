import { app, Menu, Tray, nativeImage } from 'electron';
import { windowInstance } from './window';

export class Trays {
  public main: Tray | undefined; //托盘

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
    this.main = new Tray(nativeImage.createFromDataURL(trayImgPath));
    this.main.setContextMenu(contextMenu);
    this.main.setToolTip(app.name);
    this.main.on('click', () => windowInstance.func('show'));
  }

  /**
   * 监听
   */
  on() {}
}
