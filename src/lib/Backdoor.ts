import { NS } from 'Bitburner';
import { findPath } from '/lib/Servers.js';

export async function backdoor(ns: NS, host: string) {
  let server = ns.getServer(host);

  if (!server.hasAdminRights) {
    ns.print(`Can not backdoor ${host}, you need admin rights.`);
    return;
  }

  if (server.backdoorInstalled) {
    ns.print(`You already have a backdoor installed on ${host}.`);
    return;
  }

  if (server.requiredHackingSkill > ns.getHackingLevel()) {
    ns.print(`Can not backdoor ${host}, you need a ${ns.getHackingLevel()} hacking level.`);
    return;
  }

  let path = await findPath(ns, host);
  path.forEach((host: string) => ns.connect(host));

  await ns.installBackdoor();

  path.pop();
  path.reverse();
  path.push('home');
  path.forEach((host: string) => ns.connect(host));
}
