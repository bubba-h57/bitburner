import { NS, Server } from 'Bitburner';
import { formatNumberShort } from '/lib/Helpers.js';
import { pushHackScripts, getThreadInfo, getTargets, getServerInfo } from '/lib/Servers.js';
import { openPorts } from '/lib/Ports.js';

export async function main(ns: NS) {
  const sleepInterval = 60000 * 1;
  const purchasedServerName = 'hacker';
  const minimumRam = 8192;
  let programNames = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
  let needPorthack = true;
  const hackScript = '/bin/hack.js';

  ns.disableLog('ALL');
  ns.tail();
  ns.print(`${new Date().toISOString()} Start the loop.`);
  while (ns.getServerMaxRam('home') < 2 ** 20 || ns.getServer('home').cpuCores < 8) {
    // ns.print(`${new Date().toISOString()} Cores.`);
    if (ns.upgradeHomeCores()) {
      ns.print(`${new Date().toISOString()} Upgraded Home CPU Cores to ${ns.getServer('home').cpuCores}`);
    }

    // ns.print(`${new Date().toISOString()} RAM.`);
    if (ns.upgradeHomeRam()) {
      ns.print(`${new Date().toISOString()} Upgraded Home RAM to ${formatNumberShort(ns.getServerMaxRam('home'))}`);
    }

    // ns.print(`${new Date().toISOString()} Server.`);
    let targetRam = ns.getServerMaxRam('home') > minimumRam ? ns.getServerMaxRam('home') : minimumRam;
    let newHost = ns.purchaseServer(purchasedServerName, targetRam);
    if (newHost !== '') {
      ns.print(`${new Date().toISOString()} Purchased Host: ${newHost}`);
      let targets: Server[] = getTargets(ns);
      let scriptRamCost = ns.getScriptRam(hackScript);
      let server = ns.getServer(newHost);
      let threads = getThreadInfo(server, scriptRamCost, targets.length);
      await pushHackScripts(ns, server);
      let i = 0;
      while (threads.hasRoom()) {
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
