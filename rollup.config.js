const { readdirSync, statSync } = require('fs');
const { resolve, extname } = require('path');
const { builtinModules } = require('module');
const { execSync } = require('child_process');
const { minify } = require('rollup-plugin-esbuild-minify');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');
const typescript = require('rollup-plugin-typescript2');

const plugins = () => [
  json(),
  commonjs(),
  typescript({
    useTsconfigDeclarationDir: true,
    preferBuiltins: true,
    browser: false,
    extensions: ['.mjs', '.ts', '.js', '.json', '.node']
  }),
  nodeResolve({
    preferBuiltins: true
  }),
  minify()
];

const external = [
  ...builtinModules,
  './file',
  './global',
  './log',
  './path',
  './session',
  './shortcut',
  './tray',
  './update',
  './utils',
  './window',
  './machine',
  './view',
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
          exports: 'auto',
          format: 'commonjs',
          sourcemap: false
        },
        {
          file: `./dist/${path}.mjs`,
          format: 'esm',
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
  }
  config.push(cfg);
});

module.exports = config;
