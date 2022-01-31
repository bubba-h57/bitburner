import { out, hasFlag } from "lib/term.js";
import { getServerInfo } from "lib/servers.js";
import { portsWeCanHack, openPorts } from "lib/ports.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  let servers = getServerInfo(ns);

  if (hasFlag(ns, "--ports")) {
    out(
      '<span style="color: purple;">Number of Ports we can hack: ' +
        portsWeCanHack(ns)
    ) + "</span>";
  }

  servers.forEach(async (server) => await openPorts(ns, server.hostname));
  servers = getServerInfo(ns);

  servers.forEach(async function (server) {
    if (server.purchasedByPlayer || server.hostname === "home") {
      return;
    }

    if (
      server.openPortCount >= server.numOpenPortsRequired &&
      !server.hasAdminRights
    ) {
      out(`<span style="color: red;">Nuking ${server.hostname}</span>`);
      await ns.nuke(server.hostname);
    }

    if (server.hasAdminRights) {
      if (
        !server.backdoorInstalled &&
        server.requiredHackingSkill <= ns.getHackingLevel()
      ) {
        out(
          `<span style="color: orange;">${server.hostname} needs a backdoor installed.</span>`
        );
      }
      return;
    }
  });
}
