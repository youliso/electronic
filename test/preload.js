const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronic', {
  send: (channel, args) => ipcRenderer.send(channel, args),
  sendSync: (channel, args) => ipcRenderer.sendSync(channel, args),
  on: (channel, listener) => ipcRenderer.on(channel, (_, ...args) => listener(...args)),
  once: (channel, listener) => ipcRenderer.once(channel, (_, ...args) => listener(...args)),
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

contextBridge.exposeInMainWorld('environment', {
  platform: process.platform
});
