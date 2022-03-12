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
  let tickDurration: number = 19960;
  let nextTerritoryTick: number = Date.now() + tickDurration;
  let lastTerritoryTick: number = Date.now();
  lastEnemyGangInfo = getOtherInfo(ns);
  lastGangInfo = ns.gang.getGangInformation();
  let tick = 0;
  let buffer = 0;
  let wasPrepared = false;

  while (true) {
    await ns.sleep(50);

    if (territoryTicked(ns)) {
      if (tick < 5) {
        tick++;
      }
      if (!wasPrepared) {
        buffer += 10;
      }
      if (wasPrepared) {
        buffer -= 10;
      }
      if (buffer < 1) {
        buffer = 0;
      }
      let newDurration = Date.now() - lastTerritoryTick;

      if (newDurration < tickDurration && tick > 3) {
        tickDurration = newDurration;
      }

      tickDurration -= buffer;

      lastTerritoryTick = Date.now();
      nextTerritoryTick = Date.now() + tickDurration;

      lastEnemyGangInfo = ns.gang.getOtherGangInformation();
      lastGangInfo = ns.gang.getGangInformation();

      // Get Back To Work!
      ns.gang.setTerritoryWarfare(false);
      ns.print(`ERROR Power: ${formatNumberShort(lastGangInfo.power, 6, 2)}`);
      ns.print(`ERROR Territory: ${formatNumberShort(lastGangInfo.territory * 100, 6, 2)}%`);

      ns.gang.getMemberNames().forEach((name: string) => ns.gang.setMemberTask(name, 'Train Combat'));
      ns.print('INFO ----------------');
      wasPrepared = false;
    }
    if (Date.now() > nextTerritoryTick) {
      if (weAreTheBest(ns)) {
        ns.gang.setTerritoryWarfare(true);
      }
      ns.gang.getMemberNames().forEach((name: string) => ns.gang.setMemberTask(name, 'Territory Warfare'));
      wasPrepared = true;
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
