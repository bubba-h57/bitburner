import { GangGenInfo, GangOtherInfo, NS, GangTaskStats } from 'Bitburner';
import { formatNumberShort } from '/lib/Helpers';
var lastEnemyGangInfo: GangOtherInfo;
var lastGangInfo: GangGenInfo;

interface ITask {
  name: string;
  respect: number;
  money: number;
  wanted: number;
  task: GangTaskStats;
}

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let tickDurration: number = 19850;
  let nextTerritoryTick: number = Date.now() + tickDurration;
  lastEnemyGangInfo = getOtherInfo(ns);
  lastGangInfo = ns.gang.getGangInformation();

  while (true) {
    await ns.sleep(50);

    if (territoryTicked(ns)) {
      // Get Back To Work!
      ns.gang.setTerritoryWarfare(false);
      nextTerritoryTick = Date.now() + tickDurration;
      lastEnemyGangInfo = getOtherInfo(ns);
      lastGangInfo = ns.gang.getGangInformation();
      ns.print(`Territory Power: ${formatNumberShort(lastGangInfo.power)}`);
      ns.gang.getMemberNames().forEach((name: string) => ns.gang.setMemberTask(name, 'Train Combat'));
      ns.print('Train the Combat');
    } else if (Date.now() > nextTerritoryTick) {
      if (weAreTheBest(ns)) {
        ns.gang.setTerritoryWarfare(true);
      }
      ns.gang.getMemberNames().forEach((name: string) => ns.gang.setMemberTask(name, 'Territory Warfare'));
      ns.print('Engage in Territory Warfare');
    }
  }
}

function gangs(ns: NS): string[] {
  return Object.keys(getOtherInfo(ns));
}
function getOtherInfo(ns: NS): GangOtherInfo {
  return ns.gang.getOtherGangInformation();
}

function territoryTicked(ns: NS): boolean {
  return enemyGangChanged(ns) || myGangChanged(ns);
}

function enemyGangChanged(ns: NS): boolean {
  let enemyGangCurrentInfo: GangOtherInfo = getOtherInfo(ns);
  return gangs(ns).some(
    (name) =>
      enemyGangCurrentInfo[name].power != lastEnemyGangInfo[name].power ||
      enemyGangCurrentInfo[name].territory != lastEnemyGangInfo[name].territory
  );
}

function myGangChanged(ns: NS): boolean {
  let myGangCurrentInfo: GangGenInfo = ns.gang.getGangInformation();
  return myGangCurrentInfo.power != lastGangInfo.power || myGangCurrentInfo.territory != lastGangInfo.territory;
}

function weAreTheBest(ns: NS): boolean {
  let enemyGangCurrentInfo: GangOtherInfo = getOtherInfo(ns);
  let myGangCurrentInfo: GangGenInfo = ns.gang.getGangInformation();
  return !gangs(ns).some((name) => enemyGangCurrentInfo[name].power > myGangCurrentInfo.power);
}
