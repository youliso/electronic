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
  EOL: string;
  systemVersion: string;
  platform: NodeJS.Platform;
  isSecondInstanceWin: boolean;
}
