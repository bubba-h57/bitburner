import { NS } from 'Bitburner';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();

  while (true) {
    let karma = ns.heart.break();

    ns.clearLog();
    ns.print(`Current Karma: ${karma}`);
    await ns.sleep(250);
  }
}
