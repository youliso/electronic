import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'
import { EOL } from 'os'
import { getMachineGuid } from '../main/machine'
import { Ipc, Customize, Environment } from '../types'

declare global {
  interface Window {
    ipc: Ipc
    customize: Customize
    environment: Environment
  }
}

type IpcReturnType<K extends keyof typeof Electron.ipcRenderer> = ReturnType<
  typeof Electron.ipcRenderer[K]
>

export function preloadDefaultInit(defaultEnv?: { [key: string]: any }) {
  contextBridge.exposeInMainWorld('ipc', {
    send: (...args: Ipc['send']): IpcReturnType<'send'> =>
      ipcRenderer.send(...args),
    sendSync: (...args: Ipc['sendSync']): IpcReturnType<'sendSync'> =>
      ipcRenderer.sendSync(...args),
    invoke: (...args: Ipc['invoke']): IpcReturnType<'invoke'> =>
      ipcRenderer.invoke(...args),
    on: (...args: Ipc['on']): IpcReturnType<'on'> => ipcRenderer.on(...args),
    once: (...args: Ipc['once']): IpcReturnType<'once'> =>
      ipcRenderer.once(...args),
    removeAllListeners: (channel: string) =>
      ipcRenderer.removeAllListeners(channel)
  })

  contextBridge.exposeInMainWorld('environment', {
    EOL,
    systemVersion: process.getSystemVersion(),
    platform: process.platform,
    machineGuid: getMachineGuid(),
    ...defaultEnv
  })
}
