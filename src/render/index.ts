import preload, { type PreloadInterfaceConfig } from '../preload';
export * from './app';
export * from './shortcut';
export * from './store';
export * from './window';
export * from './machine';

export const init = (config?: PreloadInterfaceConfig) => {
  preload.render(config);
};
