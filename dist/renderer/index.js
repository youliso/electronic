'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 日志(info)
 * @param args
 */
function logInfo(...args) {
    window.ipc.send("log-info", args);
}
/**
 * 日志(error)
 * @param args
 */
function logError(...args) {
    window.ipc.send("log-error", args);
}
/**
 * 设置全局参数
 * @param key 键
 * @param value 值
 */
async function sendGlobal(key, value) {
    return await window.ipc.invoke("global-sharedObject-set", {
        key,
        value,
    });
}
/**
 * 获取全局参数
 * @param key 键
 */
async function getGlobal(key) {
    return await window.ipc.invoke("global-sharedObject-get", key);
}
/**
 * 获取依赖文件路径
 * */
async function getResourcesPath(type, path) {
    return await window.ipc.invoke("global-resources-path-get", { type, path });
}
/**
 * app重启
 * @param once 是否立即重启
 */
function relaunch(once) {
    return window.ipc.send("app-relaunch", once);
}
/**
 * app常用信息
 * @returns
 */
async function getAppInfo() {
    return await window.ipc.invoke("app-info-get");
}
/**
 * app常用获取路径
 */
async function getAppPath(key) {
    return await window.ipc.invoke("app-path-get", key);
}
/**
 * app打开url
 */
async function openUrl(url) {
    return await window.ipc.invoke("app-open-url", url);
}

/**
 * 读取目录下指定后缀文件
 * @param path
 * @param fileName
 */
async function fileBySuffix(path, fileName) {
    return await window.ipc.invoke('file-filebysuffix', { path, fileName });
}
/**
 * 创建目录和内部文件
 * */
async function mkdir(path, options) {
    return await window.ipc.invoke('file-mkdir', { path, options });
}
/**
 * 删除目录和内部文件
 * */
async function delDir(path) {
    return await window.ipc.invoke('file-deldir', { path });
}
/**
 * 删除文件
 * */
async function unlink(path) {
    return await window.ipc.invoke('file-unlink', { path });
}
/**
 * 检查文件是否存在于当前目录中、以及是否可写
 * @return 0 不存在 1 只可读 2 存在可读写
 */
async function access(path) {
    return await window.ipc.invoke('file-access', { path });
}
/**
 * 文件重命名
 * @return 0 失败 1 成功
 */
async function rename(path, newPath) {
    return await window.ipc.invoke('file-rename', { path, newPath });
}
/**
 * 读取整个文件
 * @param path 文件路径
 * @param options 选项
 */
async function readFile(path, options) {
    return await window.ipc.invoke('file-readfile', { path, options });
}
/**
 * 逐行读取
 * @param path
 * @param index
 */
async function readLine(path, index) {
    return await window.ipc.invoke('file-readline', { path, index });
}
/**
 * 覆盖数据到文件
 * @return 0 失败 1 成功
 */
async function writeFile(path, data, options) {
    return await window.ipc.invoke('file-writefile', { path, data, options });
}
/**
 * 追加数据到文件
 * @return 0 失败 1 成功
 */
async function appendFile(path, data, options) {
    return await window.ipc.invoke('file-appendfile', { path, data, options });
}

async function sep() {
    return await window.ipc.invoke('path-sep');
}
async function isAbsolute(path) {
    return await window.ipc.invoke('path-isAbsolute', path);
}
async function dirname(path) {
    return await window.ipc.invoke('path-dirname', path);
}
async function normalize(path) {
    return await window.ipc.invoke('path-normalize', path);
}
async function basename(path) {
    return await window.ipc.invoke('path-basename', path);
}

/**
 * 设置http/https指定域名请求头
 * 键值对 => 域名: Headers
 */
function sessionHeadersSet(args) {
    window.ipc.send('session-headers-set', args);
}
/**
 * 获取 cookies
 * @param args
 */
function sessionCookiesGet(args) {
    return window.ipc.invoke('session-cookies-get', args);
}
/**
 * 设置 cookies
 * @param args
 */
async function sessionCookiesSet(args) {
    return window.ipc.invoke('session-cookies-set', args);
}
/**
 * 移除 Cookies
 * @param url
 * @param name
 */
async function sessionCookiesRemove(url, name) {
    return window.ipc.invoke('session-cookies-remove', { url, name });
}

/**
 * 快捷键监听
 * @param listener
 */
function shortcutOn(listener) {
    window.ipc.on(`shortcut-back`, listener);
}
/**
 * 注册快捷键 (重复注册将覆盖)
 * @param name
 * @param key
 */
async function shortcut(name, key) {
    return await window.ipc.invoke("shortcut-register", { name, key });
}
/**
 * 清除快捷键
 * @param key
 */
async function unShortcut(key) {
    return await window.ipc.invoke("shortcut-unregister", key);
}
/**
 * 清空全部快捷键
 */
async function unShortcutAll() {
    return await window.ipc.invoke("shortcut-unregisterAll");
}
/**
 * 获取已注册快捷键
 * @param key
 */
async function shortcutGet(key) {
    return await window.ipc.invoke("shortcut-get", key);
}
/**
 * 获取全部已注册快捷键
 */
async function shortcutGetAll() {
    return await window.ipc.invoke("shortcut-getAll");
}
/**
 * 获取快捷键以文本展示
 * @param e
 * @returns String Ctrl + A
 */
function getShortcutName(e) {
    let arr = [];
    let hasPrimaryKey = false;
    if (e.altKey)
        arr.push("Alt");
    if (e.ctrlKey)
        arr.push("Ctrl");
    if (e.metaKey)
        arr.push("Cmd");
    if (e.shiftKey)
        arr.push("Shift");
    switch (true) {
        case e.code.startsWith("Digit"):
            arr.push(e.code.replace("Digit", ""));
            hasPrimaryKey = true;
            break;
        case e.code.startsWith("Key"):
            arr.push(e.code.replace("Key", ""));
            hasPrimaryKey = true;
            break;
        case e.code === "Backquote":
            arr.push("`");
            hasPrimaryKey = true;
            break;
        case e.code === "Escape":
            arr.push("Esc");
            hasPrimaryKey = true;
            break;
        case e.code === "BracketLeft":
            arr.push("[");
            hasPrimaryKey = true;
            break;
        case e.code === "BracketRight":
            arr.push("]");
            hasPrimaryKey = true;
            break;
        case e.code === "Comma":
            arr.push(",");
            hasPrimaryKey = true;
            break;
        case e.code === "Period":
            arr.push(".");
            hasPrimaryKey = true;
            break;
        case e.code === "Slash":
            arr.push("/");
            hasPrimaryKey = true;
            break;
        case e.code === "ArrowRight":
            arr.push("Right");
            hasPrimaryKey = true;
            break;
        case e.code === "ArrowLeft":
            arr.push("Left");
            hasPrimaryKey = true;
            break;
        case e.code === "ArrowUp":
            arr.push("Up");
            hasPrimaryKey = true;
            break;
        case e.code === "ArrowDown":
            arr.push("Down");
            hasPrimaryKey = true;
            break;
        case [
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
            "F10",
            "F11",
            "F12",
            "Space",
            "Backspace",
            "Enter",
        ].includes(e.code):
            arr.push(e.code);
            hasPrimaryKey = true;
            break;
    }
    if (arr.length <= 1 || !hasPrimaryKey)
        return "";
    return arr.join(" + ");
}

/**
 * 更新监听
 */
function updateOn(listener) {
    window.ipc.on('update-back', listener);
}
/**
 * 关闭监听
 */
function updateListenersRemove() {
    window.ipc.removeAllListeners('update-back');
}
/**
 * 检查更新
 * @param isDel 是否删除历史更新缓存
 * @param autoDownload 是否在找到更新时自动下载更新
 */
function updateCheck(isDel = true, autoDownload = false) {
    window.ipc.send('update-check', { isDel, autoDownload });
}
/**
 * 下载更新 (如果autoDownload选项设置为 false，则可以使用此方法
 */
function updateDownload() {
    window.ipc.send('update-download');
}
/**
 * 关闭程序进行更新
 * @param isSilent 是否静默更新
 */
function updateInstall(isSilent) {
    window.ipc.send('update-install', isSilent);
}

/**
 * 窗口初始化 (i)
 * */
function windowLoad(listener) {
    window.ipc.once('window-load', listener);
}
/**
 * 窗口数据更新
 */
function windowUpdate(route) {
    window.customize.route = route;
    window.ipc.send('window-update', window.customize);
}
/**
 * 窗口聚焦失焦监听
 */
function windowBlurFocusOn(listener) {
    window.ipc.on('window-blur-focus', listener);
}
/**
 * 关闭窗口聚焦失焦监听
 */
function windowBlurFocusRemove() {
    window.ipc.removeAllListeners('window-blur-focus');
}
/**
 * 窗口大小化监听
 */
function windowMaximizeOn(listener) {
    window.ipc.on('window-maximize-status', listener);
}
/**
 * 关闭窗口大小化监听
 */
function windowMaximizeRemove() {
    window.ipc.removeAllListeners('window-maximize-status');
}
/**
 * 窗口消息监听
 */
function windowMessageOn(listener, channel = 'default') {
    window.ipc.on(`window-message-${channel}-back`, listener);
}
/**
 * 关闭窗口消息监听
 */
function windowMessageRemove(channel = 'default') {
    window.ipc.removeAllListeners(`window-message-${channel}-back`);
}
/**
 * 消息发送
 */
function windowMessageSend(value, //需要发送的内容
acceptIds = [], //指定窗口id发送
channel = 'default', //监听key（保证唯一）
isback = false //是否给自身反馈
) {
    if (acceptIds.length === 0 && typeof window.customize.parentId === 'number') {
        acceptIds = [window.customize.parentId];
    }
    window.ipc.send('window-message-send', {
        channel,
        value,
        isback,
        acceptIds,
        id: window.customize.id
    });
}
/**
 * 创建窗口
 */
function windowCreate(customize, opt) {
    return window.ipc.invoke('window-new', { customize, opt });
}
/**
 * 窗口状态
 */
async function windowStatus(type, id = window.customize.id) {
    return await window.ipc.invoke('window-status', { type, id });
}
/**
 * 窗口置顶
 */
function windowAlwaysOnTop(is, type, id = window.customize.id) {
    window.ipc.send('window-always-top-set', { id, is, type });
}
/**
 * 设置窗口大小
 */
function windowSetSize(size, resizable = true, center = false, id = window.customize.id) {
    window.ipc.send('window-size-set', { id, size, resizable, center });
}
/**
 * 设置窗口 最大/最小 大小
 */
function windowSetMaxMinSize(type, size, id = window.customize.id) {
    window.ipc.send(`window-${type}-size-set`, { id, size });
}
/**
 * 设置窗口背景颜色
 */
function windowSetBackgroundColor(color, id = window.customize.id) {
    window.ipc.send('window-bg-color-set', { id, color });
}
/**
 * 最大化&最小化当前窗口
 */
function windowMaxMin(id = window.customize.id) {
    window.ipc.send('window-max-min-size', id);
}
/**
 * 关闭窗口 (传id则对应窗口否则全部窗口)
 */
function windowClose(id = window.customize.id) {
    window.ipc.send('window-func', { type: 'close', id });
}
/**
 * 窗口显示
 * @param id 窗口id
 * @param time 延迟显示时间
 */
function windowShow(time = 0, id = window.customize.id) {
    setTimeout(() => window.ipc.send('window-func', { type: 'show', id }), time);
}
/**
 * 窗口隐藏
 */
function windowHide(id = window.customize.id) {
    window.ipc.send('window-func', { type: 'hide', id });
}
/**
 * 最小化窗口 (传id则对应窗口否则全部窗口)
 */
function windowMin(id = window.customize.id) {
    window.ipc.send('window-func', { type: 'minimize', id });
}
/**
 * 最大化窗口 (传id则对应窗口否则全部窗口)
 */
function windowMax(id = window.customize.id) {
    window.ipc.send('window-func', { type: 'maximize', id });
}
/**
 * window函数
 */
function windowFunc(type, data, id = window.customize.id) {
    window.ipc.send('window-func', { type, data, id });
}
/**
 * 通过路由获取窗口id (不传route查全部)
 */
async function windowIdGet(route) {
    return await window.ipc.invoke('window-id-get', { route });
}

exports.access = access;
exports.appendFile = appendFile;
exports.basename = basename;
exports.delDir = delDir;
exports.dirname = dirname;
exports.fileBySuffix = fileBySuffix;
exports.getAppInfo = getAppInfo;
exports.getAppPath = getAppPath;
exports.getGlobal = getGlobal;
exports.getResourcesPath = getResourcesPath;
exports.getShortcutName = getShortcutName;
exports.isAbsolute = isAbsolute;
exports.logError = logError;
exports.logInfo = logInfo;
exports.mkdir = mkdir;
exports.normalize = normalize;
exports.openUrl = openUrl;
exports.readFile = readFile;
exports.readLine = readLine;
exports.relaunch = relaunch;
exports.rename = rename;
exports.sendGlobal = sendGlobal;
exports.sep = sep;
exports.sessionCookiesGet = sessionCookiesGet;
exports.sessionCookiesRemove = sessionCookiesRemove;
exports.sessionCookiesSet = sessionCookiesSet;
exports.sessionHeadersSet = sessionHeadersSet;
exports.shortcut = shortcut;
exports.shortcutGet = shortcutGet;
exports.shortcutGetAll = shortcutGetAll;
exports.shortcutOn = shortcutOn;
exports.unShortcut = unShortcut;
exports.unShortcutAll = unShortcutAll;
exports.unlink = unlink;
exports.updateCheck = updateCheck;
exports.updateDownload = updateDownload;
exports.updateInstall = updateInstall;
exports.updateListenersRemove = updateListenersRemove;
exports.updateOn = updateOn;
exports.windowAlwaysOnTop = windowAlwaysOnTop;
exports.windowBlurFocusOn = windowBlurFocusOn;
exports.windowBlurFocusRemove = windowBlurFocusRemove;
exports.windowClose = windowClose;
exports.windowCreate = windowCreate;
exports.windowFunc = windowFunc;
exports.windowHide = windowHide;
exports.windowIdGet = windowIdGet;
exports.windowLoad = windowLoad;
exports.windowMax = windowMax;
exports.windowMaxMin = windowMaxMin;
exports.windowMaximizeOn = windowMaximizeOn;
exports.windowMaximizeRemove = windowMaximizeRemove;
exports.windowMessageOn = windowMessageOn;
exports.windowMessageRemove = windowMessageRemove;
exports.windowMessageSend = windowMessageSend;
exports.windowMin = windowMin;
exports.windowSetBackgroundColor = windowSetBackgroundColor;
exports.windowSetMaxMinSize = windowSetMaxMinSize;
exports.windowSetSize = windowSetSize;
exports.windowShow = windowShow;
exports.windowStatus = windowStatus;
exports.windowUpdate = windowUpdate;
exports.writeFile = writeFile;
//# sourceMappingURL=index.js.map
