import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let sleeveNumber: number = parseInt(ns.args[1].toString());
  let name: string = ns.args[2].toString();
  let results = ns.sleeve.setToCommitCrime(sleeveNumber, name);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
