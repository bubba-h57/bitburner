import { NS } from 'Bitburner';
import { Clone } from '/lib/Clone';
import { BladeBurner } from '/lib/BladeBurner';
import { Hacknet } from '/lib/Hacknet';
import { Crimes } from '/lib/Crime';
import { exec } from '/lib/Helpers';

var ns: NS;
var port: number;

export async function main(bubbaNS: NS) {
  // Sets our global NS var
  globalThis.ns = bubbaNS;
  // Set a global port var
  globalThis.port = 3;

  let ready = true;
  let crime = 'homicide';
  let priority: number = 0;
  let numberSleeves: number = 0;
  let now: number = performance.now();
  let crimes: Crimes = new Crimes(globalThis.ns);
  let hacknet: Hacknet = new Hacknet(globalThis.ns);

  globalThis.ns.disableLog('ALL');
  globalThis.ns.tail();

  while (ready) {
    now = performance.now();

    // Bitburner Work
    if (await exec('/opt/gang/bin/inGang')) {
      if (await exec('/opt/bladeburner/bin/joinBladeburnerDivision')) {
        let bladeBurner = new BladeBurner();
        bladeBurner.takeAction();
        priority = bladeBurner.upgradeSkill(priority);
      }
    } else {
      // Decrease Karma
      if (!globalThis.ns.isBusy()) {
        (await exec('/opt/bin/getPlayer')).strength < 100 ? await crimes.muggerHobo() : await crimes.murderHobo();
        globalThis.ns.print(`Current Karma: ${globalThis.ns.heart.break()}`);
      }
      if (globalThis.ns.gang.createGang('Slum Snakes')) {
        globalThis.ns.exec('/bin/slum/gangster.js', 'home');
        globalThis.ns.exec('/bin/slum/war.js', 'home');
      }
    }

    // Sleeves Work
    crime = 'homicide';
    numberSleeves = await Clone.numSleeves();

    for (let index = 0; index < numberSleeves; index++) {
      let sleeveStats = await Clone.stats(index);

      if (sleeveStats.shock > 0) {
        await Clone.shockRecovery(index);
        continue;
      }

      if (sleeveStats.strength < 100) {
        crime = 'mug';
      }
      await Clone.commitCrime(index, crime);
    }

    // Hacknet Work
    hacknet.purchaseNew();
    hacknet.upgradeForHashGain();

    // Sleep a moment
    await globalThis.ns.sleep(200);
  }
}
