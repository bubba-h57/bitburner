import {
  getTargets,
  getHosts,
  getThreadInfo,
  pushHackScripts,
} from "/lib/Servers.js";
import { NS, Server } from "Bitburner";

/** @param {NS } ns */
export async function main(ns: NS) {
  ns.disableLog("ALL");
  ns.tail();
  const hackScript = "/bin/hack.js"

  let targets: Server[] = getTargets(ns);

  let hosts: Server[] = getHosts(ns);

  let scriptRamCost = ns.getScriptRam(hackScript);
  let i = 0;

  // Now we will crank 'em all
  for (let n = 0; n < hosts.length; n++) {
    let server = hosts[n];
    let threads = getThreadInfo(server, scriptRamCost, targets.length);
    ns.print(server.hostname);
    ns.print(`  - Killing ${hackScript}`);
    ns.scriptKill(hackScript, server.hostname);
    ns.print(`  - Running ${hackScript}`);

    await pushHackScripts(ns, server);

    while (threads.hasRoom) {
      if (ns.isRunning(hackScript, server.hostname, targets[i].hostname)) {
        ns.print(
          "WARN " + server.hostname + " looped around to repeat targets."
        );
        break;
      }

      ns.exec(hackScript, server.hostname, threads.target, targets[i].hostname);

      threads.incrementTotal();
      i++;
      if (i === targets.length) i = 0;
      await ns.sleep(300);
    }
  }
}
