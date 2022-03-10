import { NS } from 'Bitburner';
import { Crimes } from '/lib/Crime';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let timeout = 250;
  let crimes: Crimes = new Crimes(ns);
  let $continue = ns.heart.break() >= -54000;

  while ($continue) {
    await ns.sleep(timeout);

    if (ns.isBusy()) {
      continue;
    }
    crimes.murderHobo();
    ns.print(`Current Karma: ${ns.heart.break()}`);
    $continue = ns.heart.break() >= -54000;
  }

  if (ns.heart.break() <= -54000) {
    ns.gang.createGang('Slum Snakes');
    ns.exec('/bin/slum/gangster.js', 'home');
    ns.spawn('/bin/slum/war.js');
  }
}
