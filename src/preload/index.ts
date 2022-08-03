import type { IpcRendererEvent } from 'electron'
import { contextBridge, ipcRenderer } from 'electron'
import { EOL } from 'os'
import { getMachineGuid } from '../main/machine'
import { Ipc, IpcReturnType, Customize, Environment } from '../types'

declare global {
  interface Window {
    ipc: Ipc
    customize: Customize
    environment: Environment
  }
}

export function preloadDefaultInit(defaultEnv?: { [key: string]: any }) {
  contextBridge.exposeInMainWorld('ipc', {
    send: (channel: string, ...args: any[]) =>
      ipcRenderer.send(channel, ...args),
    sendSync: (channel: string, ...args: any[]): IpcReturnType<'sendSync'> =>
      ipcRenderer.sendSync(channel, ...args),
    invoke: (channel: string, ...args: any[]): IpcReturnType<'invoke'> =>
      ipcRenderer.invoke(channel, ...args),
    on: (
      channel: string,
      listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
    ): IpcReturnType<'on'> => ipcRenderer.on(channel, listener),
    once: (
      channel: string,
      listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
    ): IpcReturnType<'once'> => ipcRenderer.once(channel, listener),
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
