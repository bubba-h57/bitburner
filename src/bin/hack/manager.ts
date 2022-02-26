import { NS } from 'Bitburner';
import { millisecondsToString, getServerNames } from '/lib/Helpers';

const HACK_SCRIPT: string = '/bin/hack/hack';
const GROW_SCRIPT: string = '/bin/hack/grow';
const WEAKEN_SCRIPT: string = '/bin/hack/weaken';

interface iTarget {
  nextAction: string;
  msDone: number;
  hackPercent: number;
  raisedSecurityLevel: number;
}

type Target = Record<string, iTarget>;

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.clearLog();

  const worker: string = ns.args[0]?.toString() || 'home';
  const singleTarget: string = ns.args[1]?.toString() || '';

  let targets: Target = {};

  if (singleTarget != '') {
    targets[singleTarget] = {
      nextAction: 'INIT',
      msDone: 0,
      hackPercent: 90,
      raisedSecurityLevel: 0,
    };
  } else {
    getServerNames(ns).forEach((hostname: string) => {
      if (ns.getServerMaxMoney(hostname) > 0 && ns.getServerGrowth(hostname) > 1) {
        targets[hostname] = {
          nextAction: 'INIT',
          msDone: 0,
          hackPercent: 90,
          raisedSecurityLevel: 0,
        };
      }
    });
  }

  await uploadScripts(ns, worker);
  await hackLoop(ns, worker, targets);
}

async function uploadScripts(ns: NS, worker: string) {
  await ns.scp([HACK_SCRIPT, GROW_SCRIPT, WEAKEN_SCRIPT], 'home', worker);
}

async function hackLoop(ns: NS, worker: string, targets: Target) {
  const updateInterval: number = 500;

  while (true) {
    await ns.sleep(updateInterval);

    for (const [target, meta] of Object.entries(targets)) {
      meta.msDone -= updateInterval;

      if (meta.msDone < 0) {
        if (meta.nextAction === 'INIT') {
          init(ns, target, meta);
        } else if (meta.nextAction === 'WEAKEN') {
          weaken(ns, target, meta);
        } else if (meta.nextAction === 'GROW') {
          grow(ns, target, meta);
        } else if (meta.nextAction === 'HACK') {
          hack(ns, target, meta);
        }
      }
    }
  }

  function init(ns: NS, target: string, meta: iTarget) {
    log(ns, `exec ${meta.nextAction} on ${target}`);
    meta.raisedSecurityLevel = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
    log(ns, `initial weaken of ${target} ${meta.raisedSecurityLevel}`);
    meta.nextAction = 'WEAKEN';
  }

  function weaken(ns: NS, target: string, meta: iTarget) {
    log(ns, `exec ${meta.nextAction} on ${target}`);

    let weakenThreads = 0;
    while (ns.weakenAnalyze(weakenThreads++, 1) <= meta.raisedSecurityLevel) {}
    log(ns, `weakening with ${weakenThreads} threads (${millisecondsToString(ns.getWeakenTime(target))})`);
    const wait = attack(ns, 'weaken', worker, target, weakenThreads);
    if (wait >= 0) {
      meta.msDone = wait;
      meta.raisedSecurityLevel = 0;
      meta.nextAction = 'GROW';
    }
  }

  function grow(ns: NS, target: string, meta: iTarget) {
    log(ns, `exec ${meta.nextAction} on ${target}`);

    const growThreads = calcNumberOfThreadsToGrowToMax(target);
    if (growThreads > 0) {
      log(ns, `growing with ${growThreads} threads (${millisecondsToString(ns.getGrowTime(target))})`);
      const wait = attack(ns, 'grow', worker, target, growThreads);
      if (wait >= 0) {
        meta.msDone = wait;
        meta.raisedSecurityLevel += ns.growthAnalyzeSecurity(growThreads);
        meta.nextAction = 'HACK';
      }
    } else {
      meta.msDone = 0;
      meta.nextAction = 'HACK';
    }

    function calcNumberOfThreadsToGrowToMax(target: string) {
      const maxMoney = ns.getServerMaxMoney(target);
      const availableMoney = ns.getServerMoneyAvailable(target);
      const alpha = availableMoney > 0 ? 1 / (availableMoney / maxMoney) : 100;
      return Math.round(ns.growthAnalyze(target, alpha, 1));
    }
  }

  function hack(ns: NS, target: string, meta: iTarget) {
    log(ns, `exec ${meta.nextAction} on ${target}`);

    const partHackableMoney = ns.hackAnalyze(target);
    const hackThreads = Math.floor(1 / partHackableMoney / (100 / meta.hackPercent));
    ns.print(`hacking with ${hackThreads} threads (${millisecondsToString(ns.getHackTime(target))})`);
    const wait = attack(ns, 'hack', worker, target, hackThreads);
    if (wait >= 0) {
      meta.msDone = wait;
      meta.raisedSecurityLevel += ns.hackAnalyzeSecurity(hackThreads);
      meta.nextAction = 'WEAKEN';
    }
  }
}

function attack(ns: NS, type, worker, target, maxThreads) {
  let wait = 0;

  let scriptName;

  if (type === 'hack') {
    wait = ns.getHackTime(target);
    scriptName = HACK_SCRIPT;
  } else if (type === 'grow') {
    wait = ns.getGrowTime(target);
    scriptName = GROW_SCRIPT;
  } else if (type === 'weaken') {
    wait = ns.getWeakenTime(target);
    scriptName = WEAKEN_SCRIPT;
  } else {
    throw Error(`UNKNOWN TYPE: ${type}`);
  }
  const maxThreadsRam = calcMaxThreadsRam(scriptName);
  const threads = Math.min(maxThreads, maxThreadsRam);

  log(ns, `ns.exec ${scriptName} ${worker} ${threads} ${target} ${wait}`);
  if (threads < 1) {
    log(ns, `Could not exec ${scriptName} on ${worker}. Not enough RAM`);
    return -1;
  }

  if (ns.exec(scriptName, worker, threads, target) === 0) {
    log(ns, `Could not exec ${scriptName} on ${worker}. Ram full? Root?`);
    return -1;
  }

  return wait;

  function calcMaxThreadsRam(script) {
    const freeRam = ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker);
    return Math.floor(freeRam / ns.getScriptRam(script, worker));
  }
}

export function autocomplete(data, args) {
  return [...data.servers]; // This script autocompletes the list of servers.
}

function log(ns: NS, message) {
  ns.print(`${new Date().toLocaleTimeString()} ${message}`);
}
