import { builtinModules } from 'module';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sourcemap from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

const plugins = () => [
  json(),
  typescript({ tsconfig: './tsconfig.json' }),
  commonjs(),
  resolve({
    preferBuiltins: true
  }),
  sourcemap()
];

const external = [...builtinModules, 'electron', 'electron-updater', 'builder-util-runtime'];

/** @type {import('rollup').RollupOptions[]} */
const config = [
  {
    input: './src/ipc/index.ts',
    output: [{ dir: './dist/module/ipc', format: 'esm', sourcemap: true }],
    plugins: plugins()
  },
  {
    input: './src/ipc/index.ts',
    output: [
      {
        dir: './dist/ipc',
        exports: 'auto',
        format: 'commonjs',
        sourcemap: true
      }
    ],
    external,
    plugins: plugins()
  },
  {
    input: './src/modular/index.ts',
    output: [{ dir: './dist/module/modular', format: 'esm', sourcemap: true }],
    plugins: plugins()
  },
  {
    input: './src/modular/index.ts',
    output: [
      {
        dir: './dist/modular',
        exports: 'auto',
        format: 'commonjs',
        sourcemap: true
      }
    ],
    external,
    plugins: plugins()
  }
];

export default config;
