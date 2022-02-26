import { NS } from 'Bitburner';
import { Mafia } from '/lib/Mafia';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  const updateInterval = 200;
  ns.tail();

  let mafia: Mafia = new Mafia(ns);

  while (true) {
    mafia.recruit();
    mafia.manage();
    await ns.sleep(updateInterval);
  }
}
