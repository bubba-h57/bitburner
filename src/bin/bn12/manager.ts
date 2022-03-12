import { NS } from 'Bitburner';
import { Sleeve } from '/lib/Sleeve';
import { BladeBurner } from '/lib/BladeBurner';
import { Hacknet } from '/lib/Hacknet';
import { Crimes } from '/lib/Crime';
import { exec } from '/lib/Helpers';

export async function main(ns: NS) {
  let ready = true;
  let crime = 'homicide';
  let priority: number = 0;
  let numberSleeves: number = 0;
  let sleeve = new Sleeve(ns, 1);
  let now: number = performance.now();
  let hacknet: Hacknet = new Hacknet(ns);
  let crimes: Crimes = new Crimes(ns);

  ns.disableLog('ALL');
  ns.tail();

  while (ready) {
    now = performance.now();

    // Bitburner Work
    if (await exec(ns, '/opt/gang/bin/inGang', 3)) {
      if (await exec(ns, '/opt/bladeburner/bin/joinBladeburnerDivision', 3)) {
        let bladeBurner = new BladeBurner(ns);
        bladeBurner.takeAction();
        priority = bladeBurner.upgradeSkill(priority);
      }
    } else {
      // Decrease Karma
      if (!ns.isBusy()) {
        (await exec(ns, '/opt/bin/getPlayer', 3)).strength < 100
          ? await crimes.muggerHobo()
          : await crimes.murderHobo();
        ns.print(`Current Karma: ${ns.heart.break()}`);
      }
      if (ns.gang.createGang('Slum Snakes')) {
        ns.exec('/bin/slum/gangster.js', 'home');
        ns.exec('/bin/slum/war.js', 'home');
      }
    }

    // Sleeves Work
    crime = 'homicide';
    numberSleeves = await sleeve.getNumSleeves();

    for (let index = 0; index < numberSleeves; index++) {
      let sleeveStats = await sleeve.getSleeveStats(index);

      if (sleeveStats.shock > 0) {
        await exec(ns, '/opt/sleeve/bin/setToShockRecovery', 3, [index]);
        continue;
      }

      if (sleeveStats.strength < 100) {
        crime = 'mug';
      }
      await exec(ns, '/opt/sleeve/bin/setToCommitCrime', 3, [index, crime]);
    }

    // Hacknet Work
    hacknet.purchaseNew();
    hacknet.upgradeForHashGain();

    // Sleep a moment
    await ns.sleep(200);
  }
}
