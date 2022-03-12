import { NS } from 'Bitburner';
import { Hacknet } from '/lib/Hacknet';

export async function main(ns: NS) {
  let hacknet: Hacknet = new Hacknet(ns);
  let run: boolean = true;

  while (run) {
    hacknet.purchaseNew();
    hacknet.upgradeForHashGain();
    await ns.sleep(200);
  }
}
