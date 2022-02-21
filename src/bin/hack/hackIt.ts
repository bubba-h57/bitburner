import { NS } from 'Bitburner';
import { humanReadable } from '/lib/Helpers.js';

export async function main(ns: NS) {
  await configLogs(ns);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    let target = await getTarget(ns);
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    var securityThresh = ns.getServerMinSecurityLevel(target) + 2;

    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      let securityDecrease = await ns.weaken(target);
      log(ns, `Decreased ${target} security by ${securityDecrease}.`, 'ALERT');
      continue;
    }
    if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      let growthMultiplier = await ns.grow(target);
      log(ns, `Increased ${target} bank account by ${growthMultiplier}.`);
      continue;
    }
    // Otherwise, hack it
    let stolen = await ns.hack(target);
    log(ns, `Stole ${humanReadable(stolen)} from ${target}'s bank account.`, 'WARNING');
  }
}

function log(ns: NS, message: string, loglevel = 'INFO') {
  let logLevels = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'];

  const timestamp = new Date().toISOString();
  ns.print(timestamp + ' '.repeat(3) + loglevel.padEnd(12, ' ') + message);
}

async function configLogs(ns: NS) {
  let logs = [
    'disableLog',
    'getServerMaxMoney',
    'getServerMinSecurityLevel',
    'getServerSecurityLevel',
    'getServerMoneyAvailable',
    'weaken',
    'grow',
    'hack',
  ];

  logs.forEach(async (command) => ns.disableLog(command));
}

async function getTarget(ns: NS) {
  if (ns.args[0] !== undefined) {
    return ns.args[0];
  }

  if (ns.getHostname() != 'home') {
    await ns.scp('target.txt', 'home', ns.getHostname());
  }

  return await ns.read('target.txt');
}

export function autocomplete(data, args) {
  return [...data.servers];
}
