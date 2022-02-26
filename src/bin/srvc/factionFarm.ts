import { NS, Server } from 'Bitburner';
import { config } from '/lib/Config';
import { getTargets, getHosts, getThreadInfo, pushHackScripts } from '/lib/Servers';
import { formatNumberShort } from '/lib/Helpers';

export async function main(ns: NS) {
  ns.disableLog('ALL');

  let hosts: Server[] = await getHosts(ns);
  let scriptRamCost = ns.getScriptRam(config('factions.share_script'), 'home');

  for (let n = 0; n < hosts.length; n++) {
    let server = hosts[n];
    let threads = getThreadInfo(server, scriptRamCost, 1);

    ns.print(server.hostname);

    if (threads.numberOfThreadsToRun < 1) {
      ns.print(`${server.hostname} has no room for Threads.`);
      continue;
    }

    ns.scriptKill(config('factions.share_script'), server.hostname);

    if (server.hostname !== 'home') {
      await pushHackScripts(ns, server);
    }

    await ns.scp(config('factions.share_script'), 'home', server.hostname);
    ns.print(`  - ${server.hostname} has room for ${formatNumberShort(threads.possibleThreadsToRun)} Threads.`);
    ns.exec(config('factions.share_script'), server.hostname, threads.numberOfThreadsToRun);

    await ns.sleep(200);
  }
}
