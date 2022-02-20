import { NS, Server } from 'Bitburner';
import { formatNumberShort } from '/lib/Helpers.js';
import { pushHackScripts, getThreadInfo, getTargets, getServerInfo } from '/lib/Servers.js';
import { openPorts } from '/lib/Ports.js';

export async function main(ns: NS) {
  const sleepInterval = 60000 * 0.5;
  const purchasedServerName = 'hacker';
  const minimumRam = 8192;
  let programNames = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
  let needPorthack = true;
  const hackScript = '/bin/hack/hack.js';
  let scriptRamCost = ns.getScriptRam(hackScript);

  ns.disableLog('ALL');
  ns.tail();
  ns.print(`${new Date().toISOString()} Start the loop.`);

  while (
    ns.getPurchasedServers().length < ns.getPurchasedServerLimit() ||
    ns.getServerMaxRam('home') < Math.pow(2, 30) ||
    ns.getServer('home').cpuCores < 8 ||
    ns.getPurchasedServers().length < ns.getPurchasedServerLimit()
  ) {
    let home = ns.getServer('home');
    if (ns.upgradeHomeCores()) {
      ns.print(`${new Date().toISOString()} Upgraded Home CPU Cores to ${home.cpuCores}`);
      await hackHome(ns, home, hackScript, scriptRamCost);
    }

    // ns.print(`${new Date().toISOString()} RAM.`);
    if (ns.upgradeHomeRam()) {
      ns.print(`${new Date().toISOString()} Upgraded Home RAM to ${formatNumberShort(ns.getServerMaxRam('home'))}`);
      await hackHome(ns, home, hackScript, scriptRamCost);
    }

    // ns.print(`${new Date().toISOString()} Server.`);
    let targetRam = minimumRam;
    if (ns.getServerMaxRam('home') < Math.pow(2, 20) && ns.getServerMaxRam('home') > minimumRam) {
      targetRam = ns.getServerMaxRam('home');
    }
    if (ns.getServerMaxRam('home') > Math.pow(2, 20)) {
      targetRam = Math.pow(2, 20);
    }

    let newHost = ns.purchaseServer(purchasedServerName, targetRam);
    if (newHost !== '') {
      ns.print(`${new Date().toISOString()} Purchased Host: ${newHost}`);
      let targets: Server[] = getTargets(ns);

      let server = ns.getServer(newHost);
      let threads = getThreadInfo(server, scriptRamCost, targets.length);
      await pushHackScripts(ns, server);
      let i = 0;
      while (threads.hasRoom() && targets.length > 0) {
        if (ns.isRunning(hackScript, server.hostname, targets[i].hostname)) {
          ns.print(`${new Date().toISOString()} WARN ${server.hostname} looped around to repeat targets.`);
          break;
        }

        ns.exec(hackScript, server.hostname, threads.numberOfThreadsToRun, targets[i].hostname);

        threads.incrementTotal();
        i++;
        if (i === targets.length) i = 0;
        await ns.sleep(300);
      }
    }
    // ns.print(`${new Date().toISOString()} TOR.`);
    if (!canShop(ns)) {
      if (ns.purchaseTor()) {
        ns.print(`${new Date().toISOString()} Purchased the TOR Router`);
      }
    }

    // ns.print(`${new Date().toISOString()} Port Hacks.`);
    if (canShop(ns) && needPorthack) {
      for (const prog of programNames) {
        if (!ns.fileExists(prog, 'home') && ns.purchaseProgram(prog)) {
          ns.print(`${new Date().toISOString()} Purchased ${prog}`);
          for (let server of getServerInfo(ns)) {
            await openPorts(ns, server.hostname);
          }
        } else if (!ns.fileExists(prog, 'home')) {
          needPorthack = true;
        } else {
          needPorthack = false;
        }
      }
    }
    //ns.print(`${new Date().toISOString()} Sleeping`);
    await ns.sleep(sleepInterval);
  }
}

function canShop(ns: NS): boolean {
  return ns.scan('home').includes('darkweb');
}

async function hackHome(ns: NS, home: Server, hackScript: string, scriptRamCost: number) {
  ns.scriptKill(hackScript, 'home');
  let targets: Server[] = getTargets(ns);
  let threads = getThreadInfo(home, scriptRamCost, targets.length);
  let i = 0;
  while (threads.hasRoom()) {
    if (ns.isRunning(hackScript, home.hostname, targets[i].hostname)) {
      ns.print(`${new Date().toISOString()} WARN ${home.hostname} looped around to repeat targets.`);
      break;
    }

    ns.exec(hackScript, home.hostname, threads.numberOfThreadsToRun, targets[i].hostname);

    threads.incrementTotal();
    i++;
    if (i === targets.length) i = 0;
    await ns.sleep(200);
  }
}
