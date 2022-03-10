import { NS } from 'Bitburner';
import { Skill } from '/lib/Skill';
import { BladeBurner } from '/lib/BladeBurner';
import { BladeBurnerSkills } from '/lib/BladeBurnerSkills';

export async function main(ns: NS) {
  let ready = true;
  let delay: number = 0;
  let bitburnerLastRun: number = 0;
  let span: number = 0;
  let now: number = performance.now();
  let priority: number = 0;

  let bladeBurner = new BladeBurner(ns);

  ns.disableLog('ALL');
  ns.tail();

  while (ready) {
    now = performance.now();
    span = now - bitburnerLastRun;

    if (span > delay) {
      delay = bladeBurner.canWork() ? bladeBurner.work() : bladeBurner.rest();
      bitburnerLastRun = performance.now();
    }

    BladeBurnerSkills(ns).forEach(async function (skill: Skill, index: number) {
      if (index === priority) {
        if (skill.level >= skill.targetLevel) {
          return priority++;
        }

        while (skill.cost < ns.bladeburner.getSkillPoints()) {
          if (ns.bladeburner.upgradeSkill(skill.name)) {
            ns.print('Upgrading Skill: ' + skill.name);
          }
        }
      }
    });
    await ns.sleep(200);
  }
}
