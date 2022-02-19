import { NS } from 'Bitburner';
import { humanReadable } from '/lib/Helpers.js';

export async function main(ns: NS) {
  await configLogs(ns);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    let target = await getTarget(ns);

    // Defines how much money a server should have before we hack it
    // In this case, it is set to 75% of the server's max money
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;

    // Defines the maximum security level the target server can
    // have. If the target's security level is higher than this,
    // we'll weaken it before doing anything else
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
/**
 *
 * @param {import(".").NS } ns
 * @param {*} message
 */
function log(ns, message, loglevel = 'INFO') {
  let logLevels = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG'];

  const timestamp = new Date().toISOString();
  ns.print(timestamp + ' '.repeat(3) + loglevel.padEnd(12, ' ') + message);
}

/** @param {import(".").NS } ns */
async function configLogs(ns) {
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

  logs.forEach(async (command) => await ns.disableLog(command));
}

async function getTarget(ns) {
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
