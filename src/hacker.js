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

  // kill all instances of the hack script, regardless of arguments
  hosts.forEach((server) => ns.scriptKill("hack.js", server.hostname));
  await ns.sleep(2000);

  // Now we will crank 'em all back up
  for (let n = 0; n < hosts.length; n++) {
    let host = hosts[n].hostname;
    let server = ns.getServer(host);
    let threads = 2000;
    let invThreads = 500;

    ns.scriptKill("hack.js", host);
    ns.tprintf("Setting up hacks on: " + host);

    if (host !== "home") {
      threads = invThreads;
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
      await ns.exec("hack.js", host, threads, targets[i].hostname);

      server = ns.getServer(host);
      i++;
      if (i === targets.length) i = 0;
      await ns.sleep(800);
    }
  }
}
