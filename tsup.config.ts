import { defineConfig } from 'tsup';
import { builtinModules } from 'module';

export default defineConfig(() => ({
  splitting: false,
  minify: true,
  shims: true,
  dts: true,
  clean: true,
  format: ['esm', 'cjs'],
  entry: {
    index: 'src/index.ts',
    main: 'src/main/index.ts',
    render: 'src/render/index.ts',
    preload: 'src/preload/index.ts'
  },
  external: [...builtinModules, '../types', 'electron', 'electron-updater', 'builder-util-runtime']
}));
