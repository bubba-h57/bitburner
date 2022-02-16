import { NS } from 'Bitburner';

export async function main(ns: NS) {
  ns.ls(ns.getHostname(), '.js').forEach(function (repoFilename: string) {
    if (
      repoFilename === '/bin/repo/init.js' ||
      repoFilename === '/bin/repo/pull.js' ||
      repoFilename === '/bin/repo/delete.js'
    ) {
      ns.tprint(`Will not delete ${repoFilename}.`);
      return;
    }
    let result = ns.rm(repoFilename);
    let msg = `Failed to delete ${repoFilename}.`;
    if (result) {
      msg = `Successfully deleted ${repoFilename}.`;
    }
    ns.tprintf(msg);
  });
}
