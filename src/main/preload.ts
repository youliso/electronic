import type { IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import { Customize } from './types';

export interface Ipc {
  send: (channel: string, args?: any) => void;
  sendSync: (channel: string, args?: any) => any;
  on: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => void;
  once: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => void;
  invoke: (channel: string, args?: any) => Promise<any>;
  removeAllListeners: (channel: string) => this;
}

export interface Environment {
  [key: string]: any;

  systemVersion: string;
  platform: NodeJS.Platform;
}


declare global {
  interface Window {
    ipc: Ipc;
    customize: Customize;
    environment: Environment;
  }
}

export function preloadDefaultInit(defaultEnv?: { [key: string]: any }) {
  contextBridge.exposeInMainWorld('ipc', {
    send: (channel: string, args?: any) => ipcRenderer.send(channel, args),
    sendSync: (channel: string, args?: any) => ipcRenderer.sendSync(channel, args),
    on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.once(channel, listener),
    invoke: (channel: string, args: any) => ipcRenderer.invoke(channel, args),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
  });

  contextBridge.exposeInMainWorld('environment', {
    systemVersion: process.getSystemVersion(),
    platform: process.platform,
    ...defaultEnv
  });
}
