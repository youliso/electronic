declare global {
    interface Window {
        ipc: import('./types').Ipc;
        customize: import('./types').Customize;
        environment: import('./types').Environment;
    }
}
export * from './mod/app';
export * from './mod/file';
export * from './mod/path';
export * from './mod/session';
export * from './mod/shortcut';
export * from './mod/update';
export * from './mod/window';
