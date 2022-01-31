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

export async function findPath(ns) {
  let destination = ns.args[0];
  let hostname;
  let pathToHostname = [];
  let links = { home: "" };
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
