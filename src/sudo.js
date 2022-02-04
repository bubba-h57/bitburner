import { out, hasFlag } from "lib/term.js";
import { getServerInfo, findPath } from "lib/servers.js";
import { portsWeCanHack, openPorts } from "lib/ports.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.enableLog("installBackdoor");
  ns.tail();
  let servers = getServerInfo(ns);

  if (hasFlag(ns, "--ports")) {
    out(
      '<span style="color: purple;">Number of Ports we can hack: ' +
        portsWeCanHack(ns)
    ) + "</span>";
  }

  servers.forEach(async (server) => await openPorts(ns, server.hostname));
  servers = getServerInfo(ns);

  //servers.forEach(async function (server) {
  for (let i = 0; i < servers.length; i++) {
    let server = servers[i];
    if (server.purchasedByPlayer || server.hostname === "home") {
      continue;
    }

    if (
      server.openPortCount >= server.numOpenPortsRequired &&
      !server.hasAdminRights
    ) {
      out(`<span style="color: red;">Nuking ${server.hostname}</span>`);
      await ns.nuke(server.hostname);
      server = ns.getServer(server.hostname);
    }

    if (server.hasAdminRights) {
      if (
        !server.backdoorInstalled &&
        server.requiredHackingSkill <= ns.getHackingLevel()
      ) {
        let path = await findPath(ns, server.hostname);
        path.forEach((host) => ns.connect(host));
        await ns.installBackdoor();
        path.pop();
        path.reverse();
        path.push("home");
        path.forEach((host) => ns.connect(host));
      }
    }
  }
}
