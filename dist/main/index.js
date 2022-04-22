'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var electron = require('electron');
var path = require('path');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var electronUpdater = require('electron-updater');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const logFile = electron.app.getPath('logs');
/**
 * info日志
 * @param val
 */
function logInfo(...val) {
    const date = new Date();
    const path$1 = logFile +
        `${path.sep}${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
            .getDate()
            .toString()
            .padStart(2, '0')}.info.log`;
    let data = '';
    val.forEach((e) => {
        try {
            if (typeof e === 'object')
                data += JSON.stringify(e);
            else
                data += e.toString();
        }
        catch (e) {
            data += e;
        }
    });
    write(path$1, `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] [info] ${data}${os.EOL}`);
}
/**
 * info错误
 * @param val
 */
function logError(...val) {
    const date = new Date();
    const path$1 = logFile + `${path.sep}${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.error.log`;
    let data = '';
    val.forEach((e) => {
        try {
            if (typeof e === 'object')
                data += JSON.stringify(e);
            else
                data += e.toString();
        }
        catch (e) {
            data += e;
        }
    });
    write(path$1, `[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] [error] ${data}${os.EOL}`);
}
function write(path, data) {
    try {
        fs.statSync(path);
    }
    catch (e) {
        fs.writeFileSync(path, data);
        return;
    }
    fs.appendFileSync(path, data);
}
/**
 * 监听
 */
function logOn() {
    electron.ipcMain.on('log-info', async (event, args) => logInfo(...args));
    electron.ipcMain.on('log-error', async (event, args) => logError(...args));
}

/**
 * 判空
 * */
/**
 * 深拷贝
 * @param obj
 */
function deepCopy(obj) {
    const isArray = Array.isArray(obj);
    let result = {};
    if (isArray)
        result = [];
    let temp = null;
    let key = null;
    let keys = Object.keys(obj);
    keys.map((item, index) => {
        key = item;
        temp = obj[key];
        if (temp && typeof temp === 'object') {
            if (isArray)
                result.push(deepCopy(temp));
            else
                result[key] = deepCopy(temp);
        }
        else {
            if (isArray)
                result.push(temp);
            else
                result[key] = temp;
        }
    });
    return result;
}
const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB', 'NB', 'DB'];
function bytesToSize(bytes) {
    if (bytes === 0)
        return { bytes: 0, unit: units[0] };
    let k = 1024, i = Math.floor(Math.log(bytes) / Math.log(k));
    return {
        bytes: Math.round((bytes / Math.pow(k, i)) * Math.pow(10, 1)) / Math.pow(10, 1),
        unit: units[i]
    };
}

/**
 * 窗口配置
 * @param customize
 * @param bwOptions
 * @returns
 */
function browserWindowAssembly(customize, bwOptions = {}) {
    if (!customize)
        throw new Error('not customize');
    bwOptions.minWidth = bwOptions.minWidth || bwOptions.width;
    bwOptions.minHeight = bwOptions.minHeight || bwOptions.height;
    bwOptions.width = bwOptions.width;
    bwOptions.height = bwOptions.height;
    // darwin下modal会造成整个窗口关闭(?)
    if (process.platform === 'darwin')
        delete bwOptions.modal;
    customize.headNative = customize.headNative || false;
    customize.isPackaged = electron.app.isPackaged;
    let bwOpt = Object.assign(bwOptions, {
        autoHideMenuBar: true,
        titleBarStyle: customize.headNative ? 'default' : 'hidden',
        minimizable: true,
        maximizable: true,
        frame: customize.headNative,
        show: customize.headNative,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: !electron.app.isPackaged,
            webSecurity: false,
            webviewTag: !customize.headNative && customize.url
        }
    });
    const isParentId = customize.parentId !== null &&
        customize.parentId !== undefined &&
        typeof customize.parentId === 'number';
    let parenWin = null;
    isParentId && (parenWin = Window.getInstance().get(customize.parentId));
    if (parenWin) {
        bwOpt.parent = parenWin;
        const currentWH = bwOpt.parent.getBounds();
        customize.currentWidth = currentWH.width;
        customize.currentHeight = currentWH.height;
        customize.currentMaximized = bwOpt.parent.isMaximized();
        if (customize.currentMaximized) {
            const displayWorkAreaSize = electron.screen.getPrimaryDisplay().workAreaSize;
            bwOpt.x = ((displayWorkAreaSize.width - (bwOpt.width || 0)) / 2) | 0;
            bwOpt.y = ((displayWorkAreaSize.height - (bwOpt.height || 0)) / 2) | 0;
        }
        else {
            const currentPosition = bwOpt.parent.getPosition();
            bwOpt.x =
                (currentPosition[0] + (currentWH.width - (bwOpt.width || customize.currentWidth)) / 2) | 0;
            bwOpt.y =
                (currentPosition[1] + (currentWH.height - (bwOpt.height || customize.currentHeight)) / 2) |
                    0;
        }
    }
    return { bwOpt, isParentId, parenWin };
}
/**
 * 窗口打开预处理
 */
function windowOpenHandler(webContents, parentId) {
    webContents.setWindowOpenHandler(({ url }) => {
        Window.getInstance().create({
            url,
            parentId
        });
        return { action: 'deny' };
    });
}
/**
 * 窗口加载
 */
async function load(url, win) {
    // 窗口内创建拦截
    windowOpenHandler(win.webContents);
    win.webContents.on('did-attach-webview', (_, webContents) => windowOpenHandler(webContents, win.id));
    win.webContents.on('did-finish-load', () => win.webContents.send('window-load', win.customize));
    // 窗口最大最小监听
    win.on('maximize', () => win.webContents.send('window-maximize-status', 'maximize'));
    win.on('unmaximize', () => win.webContents.send('window-maximize-status', 'unmaximize'));
    // 聚焦失焦监听
    win.on('blur', () => win.webContents.send('window-blur-focus', 'blur'));
    win.on('focus', () => win.webContents.send('window-blur-focus', 'focus'));
    if (url.startsWith('https://') || url.startsWith('http://'))
        await win.loadURL(url, win.customize.loadOptions);
    else
        await win.loadFile(url, win.customize.loadOptions);
    return win.id;
}
class Window {
    constructor() { }
    static getInstance() {
        if (!Window.instance)
            Window.instance = new Window();
        return Window.instance;
    }
    /**
     * 获取窗口
     * @param id 窗口id
     * @constructor
     */
    get(id) {
        return electron.BrowserWindow.fromId(id);
    }
    /**
     * 获取全部窗口
     */
    getAll() {
        return electron.BrowserWindow.getAllWindows();
    }
    /**
     * 获取主窗口(无主窗口获取后存在窗口)
     */
    getMain() {
        const all = electron.BrowserWindow.getAllWindows().reverse();
        let win = null;
        for (let index = 0; index < all.length; index++) {
            const item = all[index];
            if (index === 0)
                win = item;
            if (item.customize.isMainWin) {
                win = item;
                break;
            }
        }
        return win;
    }
    /**
     * 创建窗口
     * */
    async create(customize, bwOptions = {}) {
        if (customize.isOneWindow && !customize.url) {
            for (const i of this.getAll()) {
                if (customize?.route && customize.route === i.customize?.route) {
                    i.focus();
                    return;
                }
            }
        }
        const { bwOpt, isParentId, parenWin } = browserWindowAssembly(customize, bwOptions);
        const win = new electron.BrowserWindow(bwOpt);
        //win32 取消原生窗口右键事件
        process.platform === 'win32' &&
            win.hookWindowMessage(278, () => {
                win.setEnabled(false);
                win.setEnabled(true);
            });
        //子窗体关闭父窗体获焦 https://github.com/electron/electron/issues/10616
        isParentId && win.once('close', () => parenWin?.focus());
        !customize.argv && (customize.argv = process.argv);
        customize.id = win.id;
        win.customize = customize;
        // 路由 > url
        if (!electron.app.isPackaged) {
            //调试模式
            try {
                return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('fs')); }).then(({ readFileSync }) => {
                    win.webContents.openDevTools({ mode: 'detach' });
                    let url = `http://localhost:${readFileSync(path.join('.port'), 'utf8')}`;
                    if (win.customize.url) {
                        win.customize.headNative && (url = win.customize.url);
                        !win.customize.headNative && (win.customize.route = '/Webview');
                    }
                    return load(url, win);
                });
            }
            catch (e) {
                throw 'not found .port';
            }
        }
        let url = path.join(__dirname, '../renderer/index.html');
        if (win.customize.url) {
            win.customize.headNative && (url = win.customize.url);
            !win.customize.headNative && (win.customize.route = '/Webview');
        }
        return load(url, win);
    }
    /**
     * 窗口关闭、隐藏、显示等常用方法
     */
    func(type, id, data) {
        if (id !== null && id !== undefined) {
            const win = this.get(id);
            if (!win) {
                console.error(`not found win -> ${id}`);
                return;
            }
            // @ts-ignore
            data ? win[type](...data) : win[type]();
            return;
        }
        // @ts-ignore
        if (data)
            for (const i of this.getAll())
                i[type](...data);
        else
            for (const i of this.getAll())
                i[type]();
    }
    /**
     * 窗口发送消息
     */
    send(key, value, id) {
        if (id !== null && id !== undefined) {
            const win = this.get(id);
            if (win)
                win.webContents.send(key, value);
        }
        else
            for (const i of this.getAll())
                i.webContents.send(key, value);
    }
    /**
     * 窗口状态
     */
    getStatus(type, id) {
        const win = this.get(id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        return win[type]();
    }
    /**
     * 设置窗口最小大小
     */
    setMinSize(args) {
        const win = this.get(args.id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        const workAreaSize = args.size[0]
            ? { width: args.size[0], height: args.size[1] }
            : electron.screen.getPrimaryDisplay().workAreaSize;
        win.setMaximumSize(workAreaSize.width, workAreaSize.height);
    }
    /**
     * 设置窗口最大大小
     */
    setMaxSize(args) {
        const win = this.get(args.id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        win.setMaximumSize(args.size[0], args.size[1]);
    }
    /**
     * 设置窗口大小
     */
    setSize(args) {
        let Rectangle = {
            width: args.size[0] | 0,
            height: args.size[1] | 0
        };
        const win = this.get(args.id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        const winBounds = win.getBounds();
        if (Rectangle.width === winBounds.width && Rectangle.height === winBounds.height)
            return;
        if (!args.center) {
            const winPosition = win.getPosition();
            Rectangle.x = (winPosition[0] + (winBounds.width - args.size[0]) / 2) | 0;
            Rectangle.y = (winPosition[1] + (winBounds.height - args.size[1]) / 2) | 0;
        }
        win.once('resize', () => {
            if (args.center)
                win.center();
        });
        win.setResizable(args.resizable);
        win.setMinimumSize(Rectangle.width, Rectangle.height);
        win.setBounds(Rectangle);
    }
    /**
     * 设置窗口背景色
     */
    setBackgroundColor(args) {
        const win = this.get(args.id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        win.setBackgroundColor(args.color);
    }
    /**
     * 设置窗口是否置顶
     */
    setAlwaysOnTop(args) {
        const win = this.get(args.id);
        if (!win) {
            console.error('Invalid id, the id can not be a empty');
            return;
        }
        win.setAlwaysOnTop(args.is, args.type || 'normal');
    }
    /**
     * 开启监听
     */
    on() {
        // 窗口数据更新
        electron.ipcMain.on('window-update', (event, args) => {
            if (args?.id) {
                const win = this.get(args.id);
                if (!win) {
                    console.error('Invalid id, the id can not be a empty');
                    return;
                }
                win.customize = args;
            }
        });
        // 最大化最小化窗口
        electron.ipcMain.on('window-max-min-size', (event, id) => {
            if (id !== null && id !== undefined) {
                const win = this.get(id);
                if (!win) {
                    console.error('Invalid id, the id can not be a empty');
                    return;
                }
                if (win.isMaximized())
                    win.unmaximize();
                else
                    win.maximize();
            }
        });
        // 窗口消息
        electron.ipcMain.on('window-func', (event, args) => this.func(args.type, args.id, args.data));
        // 窗口状态
        electron.ipcMain.handle('window-status', async (event, args) => this.getStatus(args.type, args.id));
        // 创建窗口
        electron.ipcMain.handle('window-new', (event, args) => this.create(args.customize, args.opt));
        // 设置窗口是否置顶
        electron.ipcMain.on('window-always-top-set', (event, args) => this.setAlwaysOnTop(args));
        // 设置窗口大小
        electron.ipcMain.on('window-size-set', (event, args) => this.setSize(args));
        // 设置窗口最小大小
        electron.ipcMain.on('window-min-size-set', (event, args) => this.setMinSize(args));
        // 设置窗口最大大小
        electron.ipcMain.on('window-max-size-set', (event, args) => this.setMaxSize(args));
        // 设置窗口背景颜色
        electron.ipcMain.on('window-bg-color-set', (event, args) => this.setBackgroundColor(args));
        // 窗口消息
        electron.ipcMain.on('window-message-send', (event, args) => {
            const channel = `window-message-${args.channel}-back`;
            if (args.acceptIds && args.acceptIds.length > 0) {
                for (const i of args.acceptIds)
                    this.send(channel, args.value, i);
                return;
            }
            if (args.isback)
                this.send(channel, args.value);
            else
                for (const win of this.getAll())
                    if (win.id !== args.id)
                        win.webContents.send(channel, args.value);
        });
        //通过路由获取窗口id (不传route查全部)
        electron.ipcMain.handle('window-id-get', async (event, args) => {
            return this.getAll()
                .filter((win) => (args.route ? win.customize?.route === args.route : true))
                .map((win) => win.id);
        });
    }
}
const windowInstance = Window.getInstance();

class Shortcut {
    constructor() {
        this.data = [];
    }
    static getInstance() {
        if (!Shortcut.instance)
            Shortcut.instance = new Shortcut();
        return Shortcut.instance;
    }
    /**
     * 添加已注册快捷键
     * @param accelerator
     */
    set(accelerator) {
        this.data.push(accelerator);
    }
    /**
     * 获取已注册快捷键
     * @param key
     */
    get(key) {
        for (let i = 0, len = this.data.length; i < len; i++) {
            const accelerator = this.data[i];
            if ((typeof accelerator.key === "string" && accelerator.key === key) ||
                (Array.isArray(accelerator.key) && accelerator.key.indexOf(key) > -1)) {
                return deepCopy(accelerator);
            }
        }
        return null;
    }
    /**
     * 获取全部已注册快捷键
     */
    getAll() {
        return deepCopy(this.data);
    }
    /**
     * 删除已注册快捷键
     * @param key
     */
    del(key) {
        for (let i = 0, len = this.data.length; i < len; i++) {
            const accelerator = this.data[i];
            if (typeof accelerator.key === "string" && accelerator.key === key) {
                this.data.splice(i, 1);
                break;
            }
            if (Array.isArray(accelerator.key)) {
                const index = accelerator.key.indexOf(key);
                if (index > -1) {
                    accelerator.key.splice(index, 1);
                    break;
                }
            }
        }
    }
    /**
     * 清空已注册快捷键
     */
    delAll() {
        // @ts-ignore
        delete this.data;
        this.data = [];
    }
    /**
     * 注册快捷键 (重复注册将覆盖)
     * @param accelerator
     */
    register(accelerator) {
        this.unregister(accelerator.key);
        if (typeof accelerator.key === "string")
            electron.globalShortcut.register(accelerator.key, accelerator.callback);
        else
            electron.globalShortcut.registerAll(accelerator.key, accelerator.callback);
        this.set(accelerator);
    }
    /**
     * 清除快捷键
     */
    unregister(key) {
        if (typeof key === "string") {
            electron.globalShortcut.unregister(key);
            this.del(key);
            return;
        }
        key.forEach((e) => {
            electron.globalShortcut.unregister(e);
            this.del(e);
        });
    }
    /**
     * 清空全部快捷键
     */
    unregisterAll() {
        electron.globalShortcut.unregisterAll();
        this.delAll();
    }
    /**
     * 监听
     */
    on() {
        electron.ipcMain.handle("shortcut-register", (event, args) => {
            const accelerator = {
                ...args,
                callback: () => windowInstance.send(`shortcut-back`, args.key),
            };
            return this.register(accelerator);
        });
        electron.ipcMain.handle("shortcut-unregister", (event, args) => this.unregister(args));
        electron.ipcMain.handle("shortcut-unregisterAll", () => this.unregisterAll());
        electron.ipcMain.handle("shortcut-get", (event, args) => {
            const accelerator = { ...this.get(args) };
            delete accelerator.callback;
            return accelerator;
        });
        electron.ipcMain.handle("shortcut-getAll", (event) => {
            const acceleratorAll = this.getAll();
            // @ts-ignore
            acceleratorAll.map((e) => delete e.callback);
            return acceleratorAll;
        });
    }
}
const shortcutInstance = Shortcut.getInstance();

class App {
    constructor() {
        //关闭硬件加速
        this.isDisableHardwareAcceleration = false;
        // 当运行第二个实例时是否为创建窗口
        this.isSecondInstanceWin = false;
        // 窗口配置
        this.windowDefaultCustomize = {};
        // 窗口参数
        this.windowDefaultOpt = {};
        // 以装载模块
        this.modular = {};
    }
    static getInstance() {
        if (!App.instance)
            App.instance = new App();
        return App.instance;
    }
    uring(module) {
        this.modular[module.name] = new module();
        this.modular[module.name].on();
    }
    usee() { }
    /**
     * 挂载模块
     * @param mod
     */
    async use(mod) {
        if (!Array.isArray(mod)) {
            const module = mod.prototype ? mod : (await mod()).default;
            this.uring(module);
            return;
        }
        (await Promise.all(mod)).forEach((module) => this.uring(module.default || module));
    }
    /**
     * 启动主进程
     */
    async start() {
        this.beforeOn();
        // 协议调起
        let argv = [];
        if (!electron.app.isPackaged)
            argv.push(path.resolve(process.argv[1]));
        argv.push('--');
        if (!electron.app.isDefaultProtocolClient(electron.app.name, process.execPath, argv))
            electron.app.setAsDefaultProtocolClient(electron.app.name, process.execPath, argv);
        await electron.app.whenReady().catch(logError);
        this.afterOn();
    }
    /**
     * 监听
     */
    beforeOn() {
        //关闭硬件加速
        this.isDisableHardwareAcceleration && electron.app.disableHardwareAcceleration();
        // 默认单例根据自己需要改
        if (!electron.app.requestSingleInstanceLock())
            electron.app.quit();
        else {
            electron.app.on('second-instance', (event, argv) => {
                // 当运行第二个实例时是否为创建窗口
                if (this.isSecondInstanceWin) {
                    const main = windowInstance.getMain();
                    if (main) {
                        if (main.isMinimized())
                            main.restore();
                        main.show();
                        main.focus();
                    }
                    return;
                }
                windowInstance.create({
                    ...this.windowDefaultCustomize,
                    argv
                }, this.windowDefaultOpt);
            });
        }
        // 渲染进程崩溃监听
        electron.app.on('render-process-gone', (event, webContents, details) => logError('[render-process-gone]', webContents.getTitle(), webContents.getURL(), JSON.stringify(details)));
        // 子进程崩溃监听
        electron.app.on('child-process-gone', (event, details) => logError('[child-process-gone]', JSON.stringify(details)));
        // 关闭所有窗口退出
        electron.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin')
                electron.app.quit();
        });
        electron.nativeTheme.addListener('updated', () => {
            windowInstance.send('socket-back', {
                shouldUseDarkColors: electron.nativeTheme.shouldUseDarkColors,
                shouldUseHighContrastColors: electron.nativeTheme.shouldUseHighContrastColors,
                shouldUseInvertedColorScheme: electron.nativeTheme.shouldUseInvertedColorScheme
            });
        });
    }
    /**
     * 监听
     */
    afterOn() {
        // darwin
        electron.app.on('activate', () => {
            if (windowInstance.getAll().length === 0)
                windowInstance.create(this.windowDefaultCustomize, this.windowDefaultOpt);
        });
        // 获得焦点时发出
        electron.app.on('browser-window-focus', () => {
            // 关闭刷新
            shortcutInstance.register({
                name: '关闭刷新',
                key: 'CommandOrControl+R',
                callback: () => { }
            });
        });
        // 失去焦点时发出
        electron.app.on('browser-window-blur', () => {
            // 注销关闭刷新
            shortcutInstance.unregister('CommandOrControl+R');
        });
        //app常用信息
        electron.ipcMain.handle('app-info-get', (event, args) => {
            return {
                name: electron.app.name,
                version: electron.app.getVersion()
            };
        });
        //app常用获取路径
        electron.ipcMain.handle('app-path-get', (event, args) => {
            return electron.app.getPath(args);
        });
        //app打开外部url
        electron.ipcMain.handle('app-open-url', async (event, args) => {
            return await electron.shell.openExternal(args);
        });
        //app重启
        electron.ipcMain.on('app-relaunch', (event, args) => {
            electron.app.relaunch({ args: process.argv.slice(1) });
            if (args)
                electron.app.exit(0);
        });
    }
}
const appInstance = App.getInstance();

/**
 * 读取目录下指定后缀文件
 * @param path
 * @param suffix
 */
function fileBySuffix(path$1, suffix) {
    try {
        let files = [];
        let dirArray = fs__default["default"].readdirSync(path$1);
        for (let d of dirArray) {
            let filePath = path.resolve(path$1, d);
            let stat = fs__default["default"].statSync(filePath);
            if (stat.isDirectory()) {
                files = files.concat(fileBySuffix(filePath, suffix));
            }
            if (stat.isFile() && path.extname(filePath) === suffix) {
                files.push(filePath);
            }
        }
        return files;
    }
    catch (e) {
        return null;
    }
}
/**
 * 删除目录和内部文件
 * */
function delDir(path) {
    let files = [];
    if (fs__default["default"].existsSync(path)) {
        files = fs__default["default"].readdirSync(path);
        files.forEach((file) => {
            let curPath = path + '/' + file;
            if (fs__default["default"].statSync(curPath).isDirectory()) {
                delDir(curPath); //递归删除文件夹
            }
            else {
                fs__default["default"].unlinkSync(curPath); //删除文件
            }
        });
        fs__default["default"].rmdirSync(path);
    }
}
/**
 * 删除文件
 * @param path
 */
function unlink(path) {
    return new Promise((resolve) => fs__default["default"].unlink(path, (err) => {
        if (err)
            resolve(0);
        else
            resolve(1);
    }));
}
/**
 * 检查文件是否存在于当前目录中、以及是否可写
 * @return 0 不存在 1 只可读 2 存在可读写
 */
function access(path) {
    return new Promise((resolve) => fs__default["default"].access(path, fs__default["default"].constants.F_OK, (err) => {
        if (err)
            err.code === 'ENOENT' ? resolve(0) : resolve(1);
        else
            resolve(2);
    }));
}
/**
 * 文件重命名
 * @return 0 失败 1 成功
 */
function rename(path, newPath) {
    return new Promise((resolve) => {
        fs__default["default"].rename(path, newPath, (err) => {
            if (err)
                resolve(0);
            else
                resolve(1);
        });
    });
}
/**
 * 读取整个文件
 * @param path 文件路径
 * @param options 选项
 */
function readFile(path, options) {
    return new Promise((resolve) => fs__default["default"].readFile(path, options, (err, data) => {
        if (err)
            resolve(0);
        resolve(data);
    }));
}
/**
 * 逐行读取
 * @param path
 * @param index
 */
function readLine(path, index) {
    const io = readline.createInterface({
        input: fs__default["default"].createReadStream(path)
    });
    return new Promise((resolve) => {
        switch (index) {
            case -1:
                io.on('line', (line) => {
                    line = line.replace(/(^\s*)|(\s*$)/g, '');
                    io.close();
                    if (!line)
                        line = '';
                    resolve(line);
                });
                break;
            default:
                let indes = 0;
                let data = [];
                io.on('line', (line) => {
                    indes++;
                    if (index && indes === index)
                        io.close();
                    line = line.replace(/(^\s*)|(\s*$)/g, '');
                    if (line)
                        data.push(line);
                });
                io.on('close', () => resolve(data));
        }
    });
}
/**
 * 创建目录
 * @param path
 * @param options
 * @returns 0 失败 1成功
 */
async function mkdir(path, options) {
    return new Promise((resolve) => {
        fs__default["default"].mkdir(path, options || { recursive: true }, (err) => {
            if (err) {
                resolve(0);
            }
            resolve(1);
        });
    });
}
/**
 * 创建文件
 * @return 0 失败 1 成功
 */
async function writeFile(path, data, options) {
    return new Promise((resolve) => fs__default["default"].writeFile(path, data, options || {}, (err) => {
        if (err) {
            resolve(0);
        }
        resolve(1);
    }));
}
/**
 * 追加数据到文件
 * @return 0 失败 1 成功
 */
async function appendFile(path, data, options) {
    return new Promise((resolve) => fs__default["default"].appendFile(path, data, options || {}, (err) => {
        if (err) {
            resolve(0);
        }
        resolve(1);
    }));
}
/**
 * 监听
 */
function fileOn() {
    electron.ipcMain.handle('file-filebysuffix', async (event, args) => fileBySuffix(args.path, args.fileName));
    electron.ipcMain.handle('file-mkdir', async (event, args) => mkdir(args.path, args.options));
    electron.ipcMain.handle('file-deldir', async (event, args) => delDir(args.path));
    electron.ipcMain.handle('file-unlink', async (event, args) => unlink(args.path));
    electron.ipcMain.handle('file-access', async (event, args) => access(args.path));
    electron.ipcMain.handle('file-rename', async (event, args) => rename(args.path, args.newPath));
    electron.ipcMain.handle('file-readfile', async (event, args) => readFile(args.path, args.options));
    electron.ipcMain.handle('file-readline', async (event, args) => readLine(args.path, args.index));
    electron.ipcMain.handle('file-writefile', async (event, args) => writeFile(args.path, args.data, args.options));
    electron.ipcMain.handle('file-appendfile', async (event, args) => appendFile(args.path, args.data, args.options));
}

/**
 * Global
 */
class Global {
    constructor() {
        this.sharedObject = {};
    }
    static getInstance() {
        if (!Global.instance)
            Global.instance = new Global();
        return Global.instance;
    }
    /**
     * 挂载配置
     * @param path 配置文件路径
     * @param seat 存放位置
     * @param parse 是否parse
     * @param opt
     */
    async use(conf) {
        if (Array.isArray(conf)) {
            for (let index = 0; index < conf.length; index++) {
                const c = conf[index];
                try {
                    const cfg = (await readFile(c.path, c.opt || { encoding: 'utf-8' }));
                    if (cfg)
                        this.sendGlobal(c.seat, c.parse ? JSON.parse(cfg) : cfg);
                }
                catch (e) {
                    logError(`[cfg ${c.path}]`, e);
                }
            }
        }
        else {
            try {
                const cfg = (await readFile(conf.path, conf.opt || { encoding: 'utf-8' }));
                if (cfg)
                    this.sendGlobal(conf.seat, conf.parse ? JSON.parse(cfg) : cfg);
            }
            catch (e) {
                logError(`[cfg ${conf.path}]`, e);
            }
        }
    }
    /**
     * 开启监听
     */
    on() {
        //赋值(sharedObject)
        electron.ipcMain.handle('global-sharedObject-set', (event, args) => {
            return this.sendGlobal(args.key, args.value);
        });
        //获取(sharedObject)
        electron.ipcMain.handle('global-sharedObject-get', (event, key) => {
            return this.getGlobal(key);
        });
        //获取依赖路径
        electron.ipcMain.handle('global-resources-path-get', (event, { type, path }) => {
            return this.getResourcesPath(type, path);
        });
    }
    getGlobal(key) {
        if (key === '') {
            console.error('Invalid key, the key can not be a empty string');
            return;
        }
        if (!key.includes('.') && Object.prototype.hasOwnProperty.call(this.sharedObject, key)) {
            return this.sharedObject[key];
        }
        const levels = key.split('.');
        let cur = this.sharedObject;
        for (const level of levels) {
            if (Object.prototype.hasOwnProperty.call(cur, level)) {
                cur = cur[level];
            }
            else {
                return;
            }
        }
        return cur;
    }
    sendGlobal(key, value, exists = false) {
        if (key === '') {
            console.error('Invalid key, the key can not be a empty string');
            return;
        }
        if (!key.includes('.')) {
            if (Object.prototype.hasOwnProperty.call(this.sharedObject, key) && exists) {
                console.warn(`The key ${key} looks like already exists on obj.`);
            }
            this.sharedObject[key] = value;
        }
        const levels = key.split('.');
        const lastKey = levels.pop();
        let cur = this.sharedObject;
        for (const level of levels) {
            if (Object.prototype.hasOwnProperty.call(cur, level)) {
                cur = cur[level];
            }
            else {
                console.error(`Cannot set value because the key ${key} is not exists on obj.`);
                return;
            }
        }
        if (typeof cur !== 'object') {
            console.error(`Invalid key ${key} because the value of this key is not a object.`);
            return;
        }
        if (Object.prototype.hasOwnProperty.call(cur, lastKey) && exists) {
            console.warn(`The key ${key} looks like already exists on obj.`);
        }
        cur[lastKey] = value;
    }
    /**
     * 获取资源文件路径
     * 不传path返回此根目录
     * 断言通过返回绝对路径 (inside 存在虚拟路径不做断言)
     * */
    getResourcesPath(type, path$1 = './') {
        try {
            switch (type) {
                case 'platform':
                    path$1 = path.normalize(electron.app.isPackaged
                        ? path.resolve(path.join(__dirname, '..', '..', '..', 'platform', process.platform, path$1))
                        : path.resolve(path.join('resources', 'platform', process.platform, path$1)));
                    break;
                case 'inside':
                    return (path$1 = path.normalize(electron.app.isPackaged
                        ? path.resolve(path.join(__dirname, '..', '..', 'inside', path$1))
                        : path.resolve(path.join('resources', 'inside', path$1))));
                case 'extern':
                    path$1 = path.normalize(electron.app.isPackaged
                        ? path.resolve(path.join(__dirname, '..', '..', '..', 'extern', path$1))
                        : path.resolve(path.join('resources', 'extern', path$1)));
                    break;
                case 'root':
                    path$1 = path.normalize(electron.app.isPackaged
                        ? path.resolve(path.join(__dirname, '..', '..', '..', '..', path$1))
                        : path.resolve(path.join('resources', 'root', path$1)));
                    break;
            }
            fs.accessSync(path$1, fs.constants.R_OK);
            return path$1;
        }
        catch (e) {
            logError(`[path ${path$1}]`, e);
            throw e;
        }
    }
}
const globalInstance = Global.getInstance();

function sep() {
    return path__default["default"].sep;
}
function isAbsolute(str) {
    return path__default["default"].isAbsolute(str);
}
function dirname(str) {
    return path__default["default"].dirname(str);
}
function normalize(str) {
    return path__default["default"].normalize(str);
}
function basename(str) {
    return path__default["default"].basename(str);
}
function pathOn() {
    electron.ipcMain.handle('path-sep', async (event, args) => (event.returnValue = sep()));
    electron.ipcMain.handle('path-isAbsolute', async (event, args) => (event.returnValue = isAbsolute(args)));
    electron.ipcMain.handle('path-dirname', async (event, args) => (event.returnValue = dirname(args)));
    electron.ipcMain.handle('path-normalize', async (event, args) => (event.returnValue = normalize(args)));
    electron.ipcMain.handle('path-basename', async (event, args) => (event.returnValue = basename(args)));
}

/**
 * 监听
 */
class Session {
    constructor() {
        /**
         * 头部 headers
         * 键值对 => 域名: Headers
         */
        this.urlHeaders = {};
    }
    /**
     * 拦截指定http/https请求并更换、增加headers
     */
    webRequest() {
        electron.session.defaultSession.webRequest.onBeforeSendHeaders({
            urls: ['http://*/*', 'https://*/*']
        }, (details, callback) => {
            const keys = Object.keys(this.urlHeaders).filter((key) => [0, 7, 8].includes(details.url.indexOf(key)));
            for (const key of keys)
                for (const v in this.urlHeaders[key])
                    details.requestHeaders[v] = this.urlHeaders[key][v];
            callback({ requestHeaders: details.requestHeaders });
        });
    }
    /**
     * 设置setUserAgent/acceptLanguages
     * @param userAgent
     * @param acceptLanguages
     */
    setUserAgent(userAgent, acceptLanguages) {
        electron.session.defaultSession.setUserAgent(userAgent, acceptLanguages);
    }
    /**
     * 获取 Cookies
     * @param filter
     */
    getCookies(filter) {
        return electron.session.defaultSession.cookies.get(filter);
    }
    /**
     * 设置 Cookies
     * 如果存在，则会覆盖原先 cookie.
     * @param details
     */
    async setCookies(details) {
        await electron.session.defaultSession.cookies.set(details);
    }
    /**
     * 移除 Cookies
     * @param url
     * @param name
     */
    async removeCookies(url, name) {
        await electron.session.defaultSession.cookies.remove(url, name);
    }
    /**
     * 获取缓存大小
     * @returns treatedBytes {bytes, unit}
     */
    async getCacheSize() {
        return bytesToSize(await electron.session.defaultSession.getCacheSize());
    }
    /**
     * 清除缓存
     */
    async clearCache() {
        electron.session.defaultSession.clearCache();
    }
    /**
     * 开启监听
     */
    on() {
        this.webRequest();
        //设置url请求头
        electron.ipcMain.on('session-headers-set', async (event, args) => {
            this.urlHeaders = Object.assign(this.urlHeaders, args);
        });
        //设置 Cookies
        electron.ipcMain.handle('session-cookies-set', async (event, args) => this.setCookies(args));
        //获取 Cookies
        electron.ipcMain.handle('session-cookies-get', async (event, args) => this.getCookies(args));
        //移除 Cookies
        electron.ipcMain.handle('session-cookies-remove', async (event, args) => this.removeCookies(args.url, args.name));
    }
}

class Trays {
    constructor() { }
    /**
     * 创建托盘
     * */
    create(trayImgPath) {
        const contextMenu = electron.Menu.buildFromTemplate([
            {
                label: '显示',
                click: () => windowInstance.func('show')
            },
            {
                label: '退出',
                click: () => electron.app.quit()
            }
        ]);
        this.main = new electron.Tray(electron.nativeImage.createFromDataURL(trayImgPath));
        this.main.setContextMenu(contextMenu);
        this.main.setToolTip(electron.app.name);
        this.main.on('click', () => windowInstance.func('show'));
    }
    /**
     * 监听
     */
    on() { }
}

/**
 * 更新模块 https://www.electron.build/auto-update
 * */
class Update {
    constructor(options, dirname) {
        this.options = options;
        this.dirname = dirname;
        if (process.platform === 'win32')
            this.autoUpdater = new electronUpdater.NsisUpdater(this.options);
        else if (process.platform === 'darwin')
            this.autoUpdater = new electronUpdater.MacUpdater(this.options);
        else
            this.autoUpdater = new electronUpdater.AppImageUpdater(this.options);
        //本地开发环境，使用调试app-update.yml地址
        if (!electron.app.isPackaged && !(process.platform === 'darwin')) {
            this.autoUpdater.updateConfigPath = path.join('resources/build/cfg/app-update.yml');
        }
    }
    /**
     * 删除更新包文件
     */
    handleUpdate() {
        const updatePendingPath = path.join(
        // @ts-ignore
        this.autoUpdater.app.baseCachePath, this.dirname, 'pending');
        try {
            delDir(updatePendingPath);
        }
        catch (e) { }
    }
    /**
     * 检查更新
     */
    open(callback) {
        const message = {
            error: { code: 0, msg: '检查更新出错' },
            checking: { code: 1, msg: '正在检查更新' },
            updateAva: { code: 2, msg: '检测到新版本' },
            updateDown: { code: 3, msg: '下载中' },
            updateDownload: { code: 4, msg: '下载完成' },
            updateNotAva: { code: 5, msg: '当前为最新版本' }
        };
        this.autoUpdater.on('error', () => callback(message.error));
        this.autoUpdater.on('checking-for-update', () => callback(message.checking));
        this.autoUpdater.on('update-available', () => callback(message.updateAva));
        this.autoUpdater.on('update-not-available', () => callback(message.updateNotAva));
        // 更新下载进度事件
        this.autoUpdater.on('download-progress', (progressObj) => {
            message.updateDown.value = progressObj;
            callback(message.updateDown);
        });
        // 下载完成事件
        this.autoUpdater.on('update-downloaded', () => callback(message.updateDownload));
    }
    /**
     * 检查更新
     * @param isDel 是否删除历史更新缓存
     * @param autoDownload 是否在找到更新时自动下载更新
     */
    checkUpdate(isDel, autoDownload = false) {
        if (isDel)
            this.handleUpdate();
        this.autoUpdater.autoDownload = autoDownload;
        this.autoUpdater.checkForUpdates().catch(logError);
    }
    /**
     * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
     */
    downloadUpdate() {
        this.autoUpdater.downloadUpdate().catch(logError); //TODO待完善
    }
    /**
     * 关闭程序进行更新
     * @param isSilent 是否静默更新
     */
    updateQuitInstall(isSilent = false) {
        this.autoUpdater.quitAndInstall(isSilent);
    }
    /**
     * 开启监听
     */
    on() {
        //开启更新监听
        this.open((data) => windowInstance.send('update-back', data));
        //检查更新
        electron.ipcMain.on('update-check', (event, args) => this.checkUpdate(args.isDel, args.autoDownload));
        //手动下载更新
        electron.ipcMain.on('update-download', (event, args) => this.downloadUpdate());
        // 关闭程序安装新的软件 isSilent 是否静默更新
        electron.ipcMain.on('update-install', (event, isSilent) => this.updateQuitInstall(isSilent));
    }
}

exports.Session = Session;
exports.Trays = Trays;
exports.Update = Update;
exports.Window = Window;
exports.access = access;
exports.appInstance = appInstance;
exports.appendFile = appendFile;
exports.basename = basename;
exports.delDir = delDir;
exports.dirname = dirname;
exports.fileBySuffix = fileBySuffix;
exports.fileOn = fileOn;
exports.globalInstance = globalInstance;
exports.isAbsolute = isAbsolute;
exports.logError = logError;
exports.logInfo = logInfo;
exports.logOn = logOn;
exports.mkdir = mkdir;
exports.normalize = normalize;
exports.pathOn = pathOn;
exports.readFile = readFile;
exports.readLine = readLine;
exports.rename = rename;
exports.sep = sep;
exports.shortcutInstance = shortcutInstance;
exports.unlink = unlink;
exports.windowInstance = windowInstance;
exports.writeFile = writeFile;
//# sourceMappingURL=index.js.map
