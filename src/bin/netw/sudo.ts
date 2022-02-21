import { NS } from 'Bitburner';
import { getServerInfo, findPath } from '/lib/Servers.js';
import { openPorts } from '/lib/Ports.js';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('installBackdoor');
  ns.tail();
  let servers = await getServerInfo(ns);

  servers.forEach(async (server: { hostname: any }) => await openPorts(ns, server.hostname));
  servers = await getServerInfo(ns);

  for (let i = 0; i < servers.length; i++) {
    let server = servers[i];
    if (server.purchasedByPlayer || server.hostname === 'home') {
      continue;
    }

    if (server.openPortCount >= server.numOpenPortsRequired && !server.hasAdminRights) {
      ns.print(`Nuking ${server.hostname}`);
      ns.nuke(server.hostname);
      server = ns.getServer(server.hostname);
    }
  }

  for (let i = 0; i < servers.length; i++) {
    let server = servers[i];
    if (server.hasAdminRights) {
      if (!server.backdoorInstalled && server.requiredHackingSkill <= ns.getHackingLevel()) {
        let path = await findPath(ns, server.hostname);
        path.forEach((host: string) => ns.connect(host));
        await ns.installBackdoor();
        path.pop();
        path.reverse();
        path.push('home');
        path.forEach((host: string) => ns.connect(host));
      }
    }
  }
}
