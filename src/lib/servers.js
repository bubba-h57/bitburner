/**
 * Get the list of servers connected to a server.
 * @remarks
 *
 * Returns an array containing the hostnames of all servers that are one
 * node way from the specified target server. The hostnames in the returned
 * array are strings.
 *
 * @param {import("../").NS } ns - Required, Netscript Interface. Collection
 *                               of all Netscript functions passed to scripts
 * @param rootHost - Optional, Hostname of the server to scan, default to current server.
 * @returns Returns an array of hostnames.
 */
export function getAllServers(ns, rootHost = "home") {
  ns.disableLog("scan");
  let pendingScan = [rootHost];
  const list = new Set(pendingScan);

  while (pendingScan.length) {
    const hostname = pendingScan.shift();
    list.add(hostname);
    pendingScan.push(...ns.scan(hostname));
    pendingScan = pendingScan.filter((host) => !list.has(host));
  }

  return [...list];
}

/**
 * Returns an array of Server objects
 * from the array of hostnames passed in.
 *
 * @param {import("../").NS} ns
 * @param {string[]} servers
 * @returns Server[]
 */
export function getServerInfo(ns, servers) {
  let serverData = [];

  servers = servers ?? getAllServers(ns);

  servers.forEach(function (hostname) {
    /** @param {import(".").Server } server */
    let server = ns.getServer(hostname);
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

/**
 *
 * @param {import("../").NS} ns
 * @param {string} destination
 * @returns
 */
export async function findPath(ns, destination = "", current = "home") {
  let hostname;
  let pathToHostname = [];
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
 * @param {import("../").NS} ns
 * @param {import("../").Server} server
 */
export async function pushHackScripts(ns, server) {
  if (server.hostname === "home") {
    return;
  }
  await ns.scp(
    ["hack.js", "/lib/helpers.js", "/lib/term.js"],
    "home",
    server.hostname
  );
}

/**
 *
 * @param {import("../").Server} server
 * @param {number} scriptCost
 * @param {number} mumberOfTargets
 * @returns {Object}
 */
export function getThreadInfo(server, scriptCost, mumberOfTargets) {
  let targRam = getTargetRam(server);
  let possible = targRam / scriptCost;
  return {
    possible: possible,
    target: Math.ceil(possible / mumberOfTargets),
    total: 0,
  };
}

/** @param {import("../").Server } server */
export function getTargetRam(server) {
  return server.hostname === "home" ? server.maxRam * 0.8 : server.maxRam;
}

/**
 *
 * @param {import("../").NS} ns
 * @returns {import("../").Server[]}
 */
export function getTargets(ns) {
  let servers = getServerInfo(ns).filter(
    (server) =>
      server.hasAdminRights &&
      server.requiredHackingSkill <= ns.getHackingLevel() &&
      server.moneyMax > 0
  );
  servers.sort((a, b) => b.moneyMax - a.moneyMax);
  return servers;
}

/**
 *
 * @param {import("../").NS} ns
 * @returns {import("../").Server[]}
 */
export function getHosts(ns) {
  let servers = getServerInfo(ns).filter(
    (server) =>
      server.purchasedByPlayer ||
      server.hostname === "home" ||
      (server.hasAdminRights && server.maxRam > 0)
  );
  servers.sort((a, b) => b.maxRam - a.maxRam);
  return servers;
}
