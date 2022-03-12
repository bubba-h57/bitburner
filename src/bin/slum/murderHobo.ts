import { NS } from 'Bitburner';
import { Crimes } from '/lib/Crime';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let timeout = 250;
  let crimes: Crimes = new Crimes(ns);
  let karmaTarget: number = -54000;
  let $continue = ns.heart.break() >= karmaTarget;

  while ($continue) {
    await ns.sleep(timeout);

    if (ns.isBusy()) {
      continue;
    }
    ns.getPlayer().strength < 100 ? crimes.muggerHobo() : crimes.murderHobo();
    ns.print(`Current Karma: ${ns.heart.break()}`);
    $continue = ns.heart.break() >= karmaTarget;
  }

  if (ns.heart.break() <= karmaTarget) {
    ns.gang.createGang('Slum Snakes');
    ns.exec('/bin/slum/gangster.js', 'home');
    ns.spawn('/bin/slum/war.js');
  }
}
