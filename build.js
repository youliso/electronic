const { rollup } = require('rollup');
const path = require('path');
const fs = require('fs');
const configs = require('./rollup.config.js');

(async () => {
  for (const config of configs) {
    const bundle = await rollup(config);
    for (const output of config.output) {
      const out = await bundle.write(output);
      console.log(out.output[0].type, out.output[0].facadeModuleId);
    }
  }
  fs.writeFileSync('./dist/package.json', JSON.stringify(require('./package.json'), null, 2));
  fs.writeFileSync(
    './dist/README.md',
    fs.readFileSync(path.resolve('README.md'), { encoding: 'utf8' })
  );
})();
