import { NS, Server } from "Bitburner";

/**
 * Get the list of servers connected to a server.
 *
 * Returns an array containing the hostnames of all servers that are one
 * node way from the specified target server. The hostnames in the returned
 * array are strings.
 *
 */
export function getAllServers(
  ns: NS,
  rootHost = "home"
): string[] {
  ns.disableLog("scan");
  let pendingScan = [rootHost];
  const list = new Set(pendingScan);

  while (pendingScan.length) {
    const hostname: string = pendingScan.shift() ?? "";
    list.add(hostname);
    pendingScan.push(...ns.scan(hostname));
    pendingScan = pendingScan.filter((host) => !list.has(host));
  }

  return [...list];
}

/**
 * Returns an array of Server objects
 * from the array of hostnames passed in.
 */
export function getServerInfo(ns: NS, servers?: string[]): Server[] {
  let serverData: Server[] = [];

  servers = servers ?? getAllServers(ns);

  servers.forEach(function (hostname: any) {
    let server: Server = ns.getServer(hostname);
    serverData.push(server);
  });
  return serverData;
}

/**
 * Get the list of Faction Servers
 *
 * @returns Returns an array of hostnames and assigned colors.
 */
export function factionServers() {
  return [
    { name: "CSEC", color: "yellow" },
    { name: "avmnite-02h", color: "yellow" },
    { name: "I.I.I.I", color: "yellow" },
    { name: "run4theh111z", color: "yellow" },
    { name: "The-Cave", color: "orange" },
    { name: "w0r1d_d43m0n", color: "red" },
  ];
}

export async function findPath(
  ns: NS,
  destination: string = "",
  current: string = "home"
): Promise<string[]> {
  let hostname: string | undefined;
  let pathToHostname: string[] = [];
  let links = {};
  links[current] = "";
  let queue = Object.keys(links);

  while ((hostname = queue.shift())) {
    let path = links[hostname];
    let neighboors = ns.scan(hostname);

    for (let neighboor of neighboors) {
      if (links[neighboor] === undefined) {
        queue.push(neighboor);
        links[neighboor] = `${path},${neighboor}`;

        if (neighboor === destination) {
          let path = links[neighboor].substr(1);
          pathToHostname = path.split(",");
          return pathToHostname;
        }
      }
    }
  }

  return pathToHostname;
}

/**
 *
 * @param {NS} ns
 * @param {Server} server
 */
export async function pushHackScripts(
  ns: NS,
  server: Server
) {
  if (server.hostname === "home") {
    return;
  }
  await ns.scp(
    ["/bin/hack.js", "/lib/Helpers.js", "/lib/Term.js"],
    "home",
    server.hostname
  );
}

export class ThreadInfo {
  possibleThreadsToRun: number;
  numberOfThreadsToRun: number;
  totalThreadsUsed: number;

  constructor(possible: number, target: number, total: number) {
    this.possibleThreadsToRun = possible;
    this.numberOfThreadsToRun = target;
    this.totalThreadsUsed = total;
  }

  hasRoom(): boolean {
    return this.totalThreadsUsed <= this.possibleThreadsToRun;
  }

  incrementTotal() {
    this.totalThreadsUsed += this.numberOfThreadsToRun;
  }
}

export function getThreadInfo(
  server: Server,
  scriptCost: number,
  mumberOfTargets: number
): ThreadInfo {
  let targRam = getTargetRam(server);
  let possible = targRam / scriptCost;
  return new ThreadInfo(possible, Math.ceil(possible / mumberOfTargets), 0);
}


export function getTargetRam(server: Server) {
  return server.hostname === "home" ? server.maxRam - 500 : server.maxRam;
}

export function getTargets(ns: NS): Server[] {
  let servers = getServerInfo(ns).filter(
    (server) =>
      server.hasAdminRights &&
      server.requiredHackingSkill <= ns.getHackingLevel() &&
      server.moneyMax > 0
  );
  servers.sort((a, b) => b.moneyMax - a.moneyMax);
  return servers;
}

export function getHosts(ns: NS): Server[] {
  let servers = getServerInfo(ns).filter(
    (server) =>
      server.purchasedByPlayer ||
      server.hostname === "home" ||
      (server.hasAdminRights && server.maxRam > 0)
  );
  servers.sort((a, b) => b.maxRam - a.maxRam);
  return servers;
}
