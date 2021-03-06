import { NS } from 'Bitburner';

const params = {
  baseUrl: 'http://localhost:9182',
  manifest: {
    sourceFile: 'resources/manifest.json',
    destFile: '/resources/manifest.json.txt',
  },
  pullFiles: {
    sourceFile: '/bin/repo/pull.js',
    destFile: '/bin/repo/pull.js',
  },
};

async function pullFile(ns: NS, file: { sourceFile: string; destFile: string }) {
  const manifestUrl = `${params.baseUrl}${file.sourceFile}`;
  ns.tprintf(`INFO   > Downloading ${manifestUrl} -> ${file.destFile}`);

  if (!(await ns.wget(manifestUrl, file.destFile, 'home'))) {
    ns.tprintf(`ERROR  > ${manifestUrl} -> ${file.destFile} failed.`);
    ns.exit();
  }
}

export async function main(ns: NS) {
  const files = [params.manifest, params.pullFiles];

  for (let file of files) {
    await pullFile(ns, file);
  }

  ns.tprintf(`INFO   > Successfully pulled initial files!`);
  ns.tprintf(`INFO   > Running download script...`);

  await ns.sleep(250);
  ns.run(params.pullFiles.destFile);
}
