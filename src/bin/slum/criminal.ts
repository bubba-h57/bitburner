import { NS } from 'Bitburner';
import { Crimes } from '/lib/Crime';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let timeout = 250;
  let crimes: Crimes = new Crimes(ns);

  while (true) {
    await ns.sleep(timeout);
    if (ns.isBusy()) continue;

    crimes.commitBestCrime();
  }
}
