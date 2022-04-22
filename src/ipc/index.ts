declare global {
  interface Window {
    ipc: import('../types').Ipc;
    customize: import('../types').Customize;
    environment: import('../types').Environment;
  }
}

export * from './app';
export * from './file';
export * from './path';
export * from './session';
export * from './shortcut';
export * from './update';
export * from './window';
