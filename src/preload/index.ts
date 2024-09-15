import { contextBridge, ipcRenderer } from 'electron';
import { Customize } from '../types';
import { channels } from './channel';

export interface Electronic {
  on: <T extends any>(channel: string, listener: (...args: T[]) => void) => void;
  once: <T extends any>(channel: string, listener: (...args: T[]) => void) => void;
  invoke: <T extends any, R extends any>(channel: string, args?: T) => Promise<R>;
  removeAllListeners: (channel: string) => this;
}

declare global {
  interface Window {
    electronic: Electronic;
    customize: Omit<Customize, 'winId' | 'webContentsId'> & {
      winId: number;
      webContentsId: number;
    };
  }
}

export function preloadDefaultInit() {
  contextBridge.exposeInMainWorld('electronic', {
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
}
