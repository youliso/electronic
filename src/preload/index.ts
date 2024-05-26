import { contextBridge, ipcRenderer } from 'electron';
import { Customize } from '../types';
import { channels } from './channel';

export interface Ipc {
  send: (channel: string, args?: any) => void;
  sendSync: (channel: string, args?: any) => any;
  on: (channel: string, listener: (...args: any[]) => void) => void;
  once: (channel: string, listener: (...args: any[]) => void) => void;
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
    send: (channel: string, args?: any) => {
      if (!channels.includes(channel)) {
        throw new Error('not func: ' + channel);
      }
      return ipcRenderer.send(channel, args);
    },
    sendSync: (channel: string, args?: any) => {
      if (!channels.includes(channel)) {
        throw new Error('not func: ' + channel);
      }
      return ipcRenderer.sendSync(channel, args);
    },
    invoke: (channel: string, args: any) => {
      if (!channels.includes(channel)) {
        throw new Error('not func: ' + channel);
      }
      return ipcRenderer.invoke(channel, args);
    },
    on: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.on(channel, (_, ...args) => listener(...args)),
    once: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.once(channel, (_, ...args) => listener(...args)),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
  });

  contextBridge.exposeInMainWorld('environment', {
    systemVersion: process.getSystemVersion(),
    platform: process.platform,
    ...defaultEnv
  });
}
