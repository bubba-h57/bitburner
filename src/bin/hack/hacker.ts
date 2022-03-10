import { NS, Server } from 'Bitburner';
import { config } from '/lib/Config';
import { getTargets, getHosts, getThreadInfo, pushHackScripts } from '/lib/Servers';
import { formatNumberShort } from '/lib/Helpers';

export async function main(ns: NS) {
  ns.disableLog('ALL');

  let i = 0;
  let hosts: Server[] = await getHosts(ns);
  let targets: Server[] = await getTargets(ns);
  let scriptRamCost = ns.getScriptRam(config('purchased_servers.hack_script'), 'home');

  // Now we will crank 'em all
  for (let n = 0; n < hosts.length; n++) {
    let server = hosts[n];

    ns.print(server.hostname);
    ns.print(`  - Killing ${config('purchased_servers.hack_script')}`);
    await ns.scriptKill(config('purchased_servers.hack_script'), server.hostname);
    ns.print(`  - Running ${config('purchased_servers.hack_script')}`);
    await ns.sleep(100);
    let threads = getThreadInfo(ns.getServer(server.hostname), scriptRamCost, targets.length);

    if (threads.numberOfThreadsToRun < 1) {
      ns.print(`${server.hostname} has no room for Threads.`);
      continue;
    }

    if (server.hostname !== 'home') {
      await pushHackScripts(ns, server);
    }
    ns.print(`  - ${server.hostname} has room for ${formatNumberShort(threads.possibleThreadsToRun)} Threads.`);
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
  }
}
