import { NS, Server } from 'Bitburner';
import { config } from '/lib/Config.js';
import { humanReadable } from '/lib/Helpers.js';
import { getTargets, getThreadInfo, pushHackScripts } from '/lib/Servers.js';

export async function main(ns: NS) {
  let currentServers = ns.getPurchasedServers();

  // Server purchase info
  const serverPriceInfoText = humanReadable(ns.getPurchasedServerCost(config('purchased_servers.ram')));
  ns.disableLog('ALL');
  ns.tail();

  ns.print(`Buying ${config('purchased_servers.ram')}GB servers for ${serverPriceInfoText}.`);

  let index = currentServers.length;
  while (index < config('purchased_servers.max_count')) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(config('purchased_servers.ram'))) {
      // if sufficient money, buy server, name it, upload scripts and exec MAIN_SCRIPT
      let hostname = ns.purchaseServer(
        config('purchased_servers. name_prefix') + index.toString().padStart(2, '0'),
        config('purchased_servers.ram')
      );
      ns.print(`Server ${hostname} was purchased.`);
      ++index;

      let targets: Server[] = await getTargets(ns);
      let i = 0;
      let scriptRamCost = ns.getScriptRam(config('purchased_servers.hack_script'));
      let server = ns.getServer(hostname);
      let threads = getThreadInfo(server, scriptRamCost, targets.length);

      await pushHackScripts(ns, server);

      while (threads.hasRoom()) {
        if (ns.isRunning(config('purchased_servers.hack_script'), server.hostname, targets[i].hostname)) {
          ns.print('WARN ' + server.hostname + ' looped around to repeat targets.');
          break;
        }

        ns.exec(
          config('purchased_servers.hack_script'),
          server.hostname,
          threads.numberOfThreadsToRun,
          targets[i].hostname
        );

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
