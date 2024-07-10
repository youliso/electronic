import { readdirSync, statSync } from 'fs';
import { resolve, extname } from 'path';
import { builtinModules } from 'module';
import { minify } from 'rollup-plugin-esbuild-minify';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

const plugins = () => [
  json(),
  commonjs(),
  typescript({
    useTsconfigDeclarationDir: true,
    preferBuiltins: true,
    browser: false,
    extensions: ['.ts', '.js', '.json', '.node']
  }),
  nodeResolve({
    preferBuiltins: true
  }),
  minify()
];

const external = [
  ...builtinModules,
  './app',
  './store',
  './machine',
  './preload',
  './channel',
  '../preload/channel',
  './shortcut',
  '../types',
  './update',
  './utils',
  './window',
  'electron',
  'electron-updater',
  'builder-util-runtime'
];

/** @type {import('rollup').RollupOptions[]} */
let srcPath = resolve('src');

let dPathLength = (resolve() + '/').length;

function file(path) {
  let files = [];
  let dirArray = readdirSync(path);
  for (let d of dirArray) {
    let filePath = resolve(path, d);
    let stat = statSync(filePath);
    if (stat.isDirectory()) {
      files = files.concat(file(filePath));
    }
    if (stat.isFile() && extname(filePath) === '.ts') {
      files.push(filePath);
    }
  }
  return files;
}

const flies = file(srcPath).map((e) => e.substring(dPathLength + 4, e.length - 3));
let config = [];
let tss = '';
flies.forEach((path, index) => {
  if (path.startsWith('types')) return;
  tss += `src/${path}.ts `;
  let cfg;
  if (path.startsWith('ipc')) {
    cfg = {
      input: `./src/${path}.ts`,
      output: [
        {
          file: `./dist/${path}.js`,
          format: 'es',
          sourcemap: false
        }
      ],
      external,
      plugins: plugins()
    };
  } else {
    cfg = {
      input: `./src/${path}.ts`,
      output: [
        {
          file: `./dist/${path}.js`,
          exports: 'auto',
          format: 'commonjs',
          sourcemap: false
        }
      ],
      external,
      plugins: plugins()
    };

    if (path === 'preload\\channel') cfg.output[0].exports = 'named';
  }
  config.push(cfg);
});

export default config;
