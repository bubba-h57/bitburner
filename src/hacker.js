import { getServerInfo } from "lib/servers.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  /** @type {import(".").Server[]} servers */
  let servers = getServerInfo(ns);

  /** @type {import(".").Server[]} targets */
  let targets;

  /** @type {import(".").Server[]} targets */
  let hosts;

  let scriptRamCost = ns.getScriptRam("hack.js");
  let i = 0;
  // First, sort all the money, descending.
  servers.sort((a, b) => b.moneyMax - a.moneyMax);

  targets = servers.filter(
    (server) =>
      server.hasAdminRights &&
      server.requiredHackingSkill <= ns.getHackingLevel() &&
      server.moneyMax > 0
  );

  hosts = servers.filter(
    (server) => server.purchasedByPlayer || server.hostname === "home"
  );

  for (let n = 0; n < hosts.length; n++) {
    let host = hosts[n].hostname;
    let server = ns.getServer(host);

    // kill all instances of the hack script, regardless of arguments
    ns.scriptKill("hack.js", host);
    ns.tprintf("Setting up hacks on: " + host);

    if (host !== "home") {
      await ns.scp(
        ["hack.js", "/lib/helpers.js", "/lib/term.js"],
        "home",
        host
      );
    }
    while (
      server.maxRam * 0.9 - server.ramUsed > scriptRamCost &&
      i !== targets.length
    ) {
      await ns.exec("hack.js", host, 500, targets[i].hostname);

      server = ns.getServer(host);
      i++;
      if (i === targets.length) i = 0;
      await ns.sleep(800);
    }
  }
}
