import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let type: string = ns.args[1].toString();
  let name: string = ns.args[2].toString();
  let level: boolean = ns.args[3] === true;
  let results = ns.bladeburner.setActionAutolevel(type, name, level);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
