const { rollup } = require('rollup');
const path = require('path');
const fs = require('fs');
const configs = require('./rollup.config.js');

(async () => {
  for (const config of configs) {
    const bundle = await rollup(config);
    for (const output of config.output) {
      const out = await bundle.write(output);
      console.log(out.output[0].type, out.output[0].fileName, out.output[0].facadeModuleId);
    }
  }
  fs.writeFileSync('./dist/main/package.json', JSON.stringify(require('./package.json'), null, 2));
  fs.writeFileSync(
    './dist/main/README.md',
    fs.readFileSync(path.resolve('README.md'), { encoding: 'utf8' })
  );
  const ipcPack = require('./package.json');
  ipcPack.name += '-ipc';
  fs.writeFileSync('./dist/ipc/package.json', JSON.stringify(ipcPack, null, 2));
  fs.writeFileSync(
    './dist/ipc/README.md',
    fs.readFileSync(path.resolve('README.md'), { encoding: 'utf8' })
  );
})();
