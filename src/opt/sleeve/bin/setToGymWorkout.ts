import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let sleeveNumber: number = parseInt(ns.args[1].toString());
  let gymName: string = ns.args[2].toString();
  let stat: string = ns.args[3].toString();
  let results = ns.sleeve.setToGymWorkout(sleeveNumber, gymName, stat);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
