import { builtinModules } from "module";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";

const plugins = () => [
  json(),
  typescript({
    tsconfig: "./tsconfig.json",
  }),
  commonjs(),
  resolve({
    preferBuiltins: true,
  }),
  terser(),
];

const external = [
  ...builtinModules,
  "electron",
  "electron-updater",
  "builder-util-runtime",
];

/** @type {import('rollup').RollupOptions[]} */
let config = [];
["main", "preload", "renderer", "types"].forEach((name) => {
  config.push({
    input: `./src/${name}/index.ts`,
    output: [
      {
        file: `./dist/${name}.js`,
        exports: "auto",
        format: "commonjs",
        sourcemap: false,
      },
    ],
    external,
    plugins: plugins(),
  });
  name === "renderer" &&
    config.push({
      input: `./src/${name}/index.ts`,
      output: [
        {
          file: `./dist/${name}.mjs`,
          format: "esm",
          sourcemap: false,
        },
      ],
      external,
      plugins: plugins(),
    });
});

export default config;