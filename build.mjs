import { resolve } from 'path';
import { writeFile, readFile } from 'fs/promises';

(async () => {
  await Promise.all([
    writeFile(
      './dist/package.json',
      JSON.stringify(JSON.parse(await readFile(resolve('package.json'))), null, 2)
    ),
    writeFile('./dist/README.md', await readFile(resolve('README.md'), { encoding: 'utf8' }))
  ]);
})();
