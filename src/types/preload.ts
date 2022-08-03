type IpcParameters<K extends keyof typeof Electron.ipcRenderer> = Parameters<
  typeof Electron.ipcRenderer[K]
>

export type IpcReturnType<K extends keyof typeof Electron.ipcRenderer> =
  ReturnType<typeof Electron.ipcRenderer[K]>

export interface Ipc {
  send(...args: IpcParameters<'send'>): IpcReturnType<'send'>
  sendSync(...args: IpcParameters<'sendSync'>): IpcReturnType<'sendSync'>
  on(...args: IpcParameters<'on'>): IpcReturnType<'on'>
  once(...args: IpcParameters<'once'>): IpcReturnType<'once'>
  invoke(...args: IpcParameters<'invoke'>): IpcReturnType<'invoke'>
  removeAllListeners(
    ...args: IpcParameters<'removeAllListeners'>
  ): IpcReturnType<'removeAllListeners'>
}

export interface Environment {
  [key: string]: any
  EOL: string
  systemVersion: string
  platform: NodeJS.Platform
  machineGuid: string
}
