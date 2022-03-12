import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let type: string = ns.args[1].toString();
  let name: string = ns.args[2].toString();
  let level: number = parseInt(ns.args[3].toString());
  let results = ns.bladeburner.getActionRepGain(type, name, level);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
