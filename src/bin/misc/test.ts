import { NS } from 'Bitburner';
import { Sleeve } from '/lib/Sleeve';

export async function main(ns: NS) {
  let sleeve = new Sleeve(ns, 1);
  let crime = 'homicide';
  let numberSleeves = await sleeve.getNumSleeves();
  for (let index = 0; index < numberSleeves; index++) {
    let sleeveStats = await sleeve.getSleeveStats(index);

    if (sleeveStats.strength < 100) {
      crime = 'mug';
    }
    ns.sleeve.setToCommitCrime(index, crime);
  }
}
