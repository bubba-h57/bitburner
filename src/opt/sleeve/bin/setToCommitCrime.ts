import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let sleeveNumber: number = parseInt(ns.args[1].toString());
  let name: string = ns.args[2].toString();
  let results = ns.sleeve.setToCommitCrime(sleeveNumber, name);
  ns.clearPort(port);
  try {
    await ns.writePort(port, JSON.stringify(results));
  } catch {
    ns.tprint(`Port: ${port}, Sleeve: ${sleeveNumber}, Name: ${name}, Result: ${results}`);
  }
}
