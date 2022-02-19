import { NS, Server } from 'Bitburner';
import { humanReadable } from '/lib/Helpers.js';
import { getTargets, getThreadInfo, pushHackScripts } from '/lib/Servers.js';

/** @param {NS } ns */
export async function main(ns: NS) {
  let memMap = [
    { ram: 2, cost: '110.000 K' },
    { ram: 4, cost: '220.000 K' },
    { ram: 8, cost: '440.000 K' },
    { ram: 16, cost: '880.000 K' },
    { ram: 32, cost: '  1.760 M' },
    { ram: 64, cost: '  3.520 M' },
    { ram: 128, cost: '  7.040 M' },
    { ram: 256, cost: ' 14.080 M' },
    { ram: 512, cost: ' 28.160 M' },
    { ram: 1024, cost: ' 56.320 M' },
    { ram: 2048, cost: '112.640 M' },
    { ram: 4096, cost: '225.280 M' },
    { ram: 8192, cost: '450.560 M' },
    { ram: 16384, cost: '901.120 M' },
    { ram: 32768, cost: '  1.802 B' },
    { ram: 65536, cost: '  3.604 B' },
    { ram: 131072, cost: '  7.209 B' },
    { ram: 262144, cost: ' 14.418 B' },
    { ram: 524288, cost: ' 28.836 B' },
    { ram: 1048576, cost: ' 57.672 B' },
  ];

  // hardcoded max servers as of Bitburner v1.3
  const MAX_PURCHASABLE = 25;
  // String to Prepend to purchased servers hostname, followed by a number
  const SVRNAME = 'net-';
  // Minimum RAM, in Gigabytes
  const MIN_RAM = 32000;
  // Target RAM for server is "Home" RAM, divided by SVR_RAM_RATIO, must = power of 2
  const SVR_RAM_RATIO = 1;
  const hackScript = '/bin/hack.js';
  let currentServers = ns.getPurchasedServers();
  let ram = 1048576;

  // Server purchase info
  const serverPriceInfoText = humanReadable(ns.getPurchasedServerCost(ram));
  ns.disableLog('ALL');
  ns.tail();

  ns.print(`Buying ${ram}GB servers for ${serverPriceInfoText}.`);

  let index = currentServers.length;
  while (index < MAX_PURCHASABLE) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
      // if sufficient money, buy server, name it, upload scripts and exec MAIN_SCRIPT
      let hostname = ns.purchaseServer(SVRNAME + index.toString().padStart(2, '0'), ram);
      ns.print(`Server ${hostname} was purchased.`);
      ++index;

      let targets: Server[] = getTargets(ns);
      let i = 0;
      let scriptRamCost = ns.getScriptRam(hackScript);
      let server = ns.getServer(hostname);
      let threads = getThreadInfo(server, scriptRamCost, targets.length);

      await pushHackScripts(ns, server);

      while (threads.hasRoom()) {
        if (ns.isRunning(hackScript, server.hostname, targets[i].hostname)) {
          ns.print('WARN ' + server.hostname + ' looped around to repeat targets.');
          break;
        }

        ns.exec(hackScript, server.hostname, threads.numberOfThreadsToRun, targets[i].hostname);

        threads.incrementTotal();
        i++;
        if (i === targets.length) i = 0;
        await ns.sleep(300);
      }
    } else {
      await ns.sleep(20000);
    }
  }
}
