import { defineConfig } from 'tsup';
import { builtinModules } from 'module';

export default defineConfig(() => ({
  splitting: false,
  minify: true,
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  entry: {
    index: 'src/index.ts',
    'main/index': 'src/main/index.ts',
    'main/update': 'src/main/update.ts',
    'render/index': 'src/render/index.ts',
    'render/update': 'src/render/update.ts',
    preload: 'src/preload.ts'
  },
  external: [...builtinModules, '../types', 'electron', 'electron-updater', 'builder-util-runtime']
}));
