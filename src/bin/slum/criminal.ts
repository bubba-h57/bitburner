import { NS } from 'Bitburner';
import { Crimes } from '/lib/Crime.js';
import { formatMoney } from '/lib/Helpers.js';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let timeout = 250;
  let crimes: Crimes = new Crimes(ns);

  while (true) {
    await ns.sleep(timeout);
    if (ns.isBusy()) continue;
    // ns.commitCrime("Traffick Arms");
    // let cash = formatMoney(ns.getCrimeStats("Traffick Arms").money);
    // ns.print(
    //     `Traffick Arms to Earn: ${cash}`
    // );

    crimes.commitBestCrime();
  }
}
