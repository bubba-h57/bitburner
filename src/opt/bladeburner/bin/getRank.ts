import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let results = ns.bladeburner.getRank();
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
