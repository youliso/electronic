type IpcParameters<K extends keyof typeof Electron.ipcRenderer> = Parameters<
  typeof Electron.ipcRenderer[K]
>

export interface Ipc {
  send: IpcParameters<'send'>
  sendSync: IpcParameters<'sendSync'>
  on: IpcParameters<'on'>
  once: IpcParameters<'once'>
  invoke: IpcParameters<'invoke'>
  removeAllListeners: IpcParameters<'removeAllListeners'>
}

export interface Environment {
  [key: string]: any
  EOL: string
  systemVersion: string
  platform: NodeJS.Platform
  machineGuid: string
}
