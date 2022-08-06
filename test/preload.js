const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
  send: (channel, args) => ipcRenderer.send(channel, args),
  sendSync: (channel, args) => ipcRenderer.sendSync(channel, args),
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  once: (channel, listener) => ipcRenderer.once(channel, listener),
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

contextBridge.exposeInMainWorld('environment', {
  systemVersion: process.getSystemVersion(),
  platform: process.platform
});
