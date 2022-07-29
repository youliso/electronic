export interface Ipc {
  send: typeof Electron.ipcRenderer['send']
  sendSync: typeof Electron.ipcRenderer['sendSync']
  on: typeof Electron.ipcRenderer['on']
  once: typeof Electron.ipcRenderer['once']
  invoke: typeof Electron.ipcRenderer['invoke']
  removeAllListeners: typeof Electron.ipcRenderer['removeAllListeners']
}

export interface Environment {
  [key: string]: any
  EOL: string
  systemVersion: string
  platform: NodeJS.Platform
  machineGuid: string
}
