import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let port: number = parseInt(ns.args[0].toString());
  let sleeveNumber: number = parseInt(ns.args[1].toString());
  let companyName: string = ns.args[2].toString();
  let results = ns.sleeve.setToCompanyWork(sleeveNumber, companyName);
  ns.clearPort(port);
  await ns.writePort(port, JSON.stringify(results));
}
