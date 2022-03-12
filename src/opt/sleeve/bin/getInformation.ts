import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let sleeveNumber: number = parseInt(ns.args[1].toString());
  let results = ns.sleeve.getInformation(sleeveNumber);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
