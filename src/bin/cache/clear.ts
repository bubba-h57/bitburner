import { NS } from 'Bitburner';

export async function main(ns: NS) {
  ns.ls(ns.getHostname(), '.json.txt').forEach(function (repoFilename: string) {
    let result = ns.rm(repoFilename);
    let msg = `Failed to delete ${repoFilename}.`;
    if (result) {
      msg = `Successfully deleted ${repoFilename}.`;
    }
    ns.tprintf(msg);
  });
}
