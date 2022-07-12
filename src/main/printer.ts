import type { WebContentsPrintOptions } from "electron";
import { resolve } from "path";
import { ipcMain, BrowserWindow } from "electron";

export class Printer {
  win: BrowserWindow | null = null;

  data: any[] = [];

  async open() {
    this.win = new BrowserWindow({
      show: false,
      width: 0,
      height: 0,
      useContentSize: true,
      autoHideMenuBar: true,
      frame: true,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
        devTools: false,
        webSecurity: false,
      },
    });
    this.win.customize = {
      isMainWin: false,
      silenceFunc: true,
    };
    this.win.on("close", () => {
      this.win = null;
    });
    await this.win.loadFile(resolve(__dirname, "../assets/printer.html"));
  }

  async printOpt(args: any) {
    if (!this.win) return;
    const printers = await this.win.webContents.getPrintersAsync();
    const print = printers.filter(
      (element) => element.name === args.deviceName && !element.status
    )[0];
    if (print) {
      let opt: WebContentsPrintOptions = {
        silent: true,
        landscape: args.landscape,
        printBackground: false,
        deviceName: print.name,
        margins: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        pageSize: {
          width: args.wh[0],
          height: args.wh[1],
        },
      };
      await this.print(opt);
    }
  }

  close() {
    this.win && this.win.close();
  }

  async print(opt: WebContentsPrintOptions) {
    new Promise((resolve) => {
      if (!this.win) return;
      this.win.webContents.print(opt, (data) => {
        resolve(data);
      });
    });
  }

  on() {
    this.open();
    //设置宽高
    ipcMain.on("printer-size", (event, args) => {
      if (this.win) this.win.setSize(args[0], args[1]);
      event.returnValue = 1;
    });
    //关闭打印机
    ipcMain.on("printer-quit", () => {
      if (this.win) this.win.close();
    });
    //获得打印机列表
    ipcMain.on("printer-all", (event) => {
      if (!this.win) return;
      this.win.webContents
        .getPrintersAsync()
        .then((p) => (event.returnValue = p));
    });
    //打印传参
    ipcMain.on("printer-do", (event, args) => {
      if (!this.win) return;
      this.win.webContents.send("printer-setting", args);
    });
    let is = true;
    //打印
    ipcMain.on("printer-dos", (event, args) => {
      this.printOpt(args);
    });
  }
}
