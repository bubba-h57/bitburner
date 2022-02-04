import {
  getTargets,
  getHosts,
  getThreadInfo,
  pushHackScripts,
} from "lib/servers.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  /** @type {import(".").Server[]} */
  let targets = getTargets(ns);

  /** @type {import(".").Server[]} */
  let hosts = getHosts(ns);

  let scriptRamCost = ns.getScriptRam("hack.js");
  let i = 0;

  // Now we will crank 'em all
  for (let n = 0; n < hosts.length; n++) {
    let server = hosts[n];
    let threads = getThreadInfo(server, scriptRamCost, targets.length);
    ns.print(server.hostname);
    ns.print("  - Killing hacks.js");
    ns.scriptKill("hack.js", server.hostname);
    ns.print("  - Running hacks.js");

    await pushHackScripts(ns, server);

    let keepRunning = threads.total <= threads.possible;

    while (keepRunning) {
      if (ns.isRunning("hack.js", server.hostname, targets[i].hostname)) {
        ns.print(
          "WARN " + server.hostname + " looped around to repeate targets."
        );
        break;
      }

      ns.exec("hack.js", server.hostname, threads.target, targets[i].hostname);

      threads.total += threads.target;
      keepRunning = threads.total <= threads.possible;
      i++;
      if (i === targets.length) i = 0;
      await ns.sleep(300);
    }
  }
}
