#!/usr/bin/env node
import { realpathSync} from 'fs';
import {join,dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import * as fs from 'fs';

console.log('Generating Manifest File');

const __filename = fileURLToPath(import.meta.url);
const buildPath  = join(dirname(realpathSync(__filename)), '../build')
const manifestPath = buildPath + '/resources/manifest.json';
var manifest = [];
var files = await getFiles(buildPath);

files.forEach((file) => {
  if (file.substring(buildPath.length) === '/resources/manifest.json'){
    return;
  }
    manifest.push({
        sourceFile: file.substring(buildPath.length),
        destFile: file.substring(buildPath.length)
    });
});

fs.writeFile(manifestPath, JSON.stringify(manifest), 'utf8', (err) => {
    if (err) throw err;
    console.log('The manifest file has been created!');
  });


/**
 *
 * @param {string} root
 * @returns {string[]}
 */
async function getFiles(root)  {
 return fs.promises
   .readdir(root, { withFileTypes: true })
   .then(async dirents => {
      const mapToPath = (r) => (dirent) => resolve(r, dirent.name)
      const directoryPaths = dirents.filter(a => a.isDirectory()).map(mapToPath(root))
      const filePaths = dirents.filter(a => a.isFile()).map(mapToPath(root))

     const a_4 = await Promise.all([
           ...directoryPaths.map(a_2 => getFiles(a_2)).flat(),
           ...filePaths.map(a_3 => Promise.resolve(a_3))
       ]);
       return a_4.flat();
  })
}
