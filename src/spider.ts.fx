import { NS, Server} from "Bitburner";
import { humanReadableNumbers } from "lib/Helpers.js";
import { writeOutFixedLength, hasFlag } from "lib/Term.js";
import { getServerInfo } from "lib/Servers.js";

/**
 * Crawls through the entire network and presents
 * the inventory of servers in nice formats.
 *
 *  --money      Will give you the list of servers in order of max money
 *  --backdoors  Will provide a list of servers that you could install backdoors on, but haven't yet.
 *
 * @param {NS} ns
 * @returns null
 */
export async function main(ns:NS) {
  let servers = getServerInfo(ns);

  if (hasFlag(ns, "--money")) {
    return orderByMoney(servers, ns.getHackingLevel());
  }
  if (hasFlag(ns, "--backdoors")) {
    return findBackdoors(servers, ns.getHackingLevel());
  }

  orderDefault(ns, servers);
}

/**
 * Just prints out the list in alphabetical order.
 *
 * @param {Server[] } servers
 */
function orderDefault(ns: NS, servers: any[]) {
  servers
    .sort(function (a: { hostname: string; }, b: { hostname: string; }) {
      let aHostname = a.hostname.toUpperCase();
      let bHostname = b.hostname.toUpperCase();
      return aHostname < bHostname ? -1 : aHostname > bHostname ? 1 : 0;
    })
    .forEach((server: { hostname: string; organizationName: string; }) =>
      ns.print("  - " + server.hostname + "\t\t" + server.organizationName)
    );
}

/**
 * Prints a list of servers that you could backdoor.
 *
 * @param {import(".").Server[] } servers
 * @param {number} currskill
 */
function findBackdoors(servers: any[], currskill: number) {
  servers
    .filter(function (server: { hasAdminRights: any; backdoorInstalled: any; requiredHackingSkill: number; }) {
      return (
        server.hasAdminRights &&
        !server.backdoorInstalled &&
        server.requiredHackingSkill <= currskill
      );
    })
    .forEach(function (server: { hostname: string; }) {
      writeOutFixedLength(server.hostname);
    });
}

/**
 * Prints a list of server in order of most profitable descending.
 *
 * @param {import(".").Server[] } servers
 */
function orderByMoney(servers: any[], currskill: number) {
  servers
    .sort((a: { moneyMax: number; }, b: { moneyMax: number; }) => b.moneyMax - a.moneyMax)
    .filter(
      (server: { hasAdminRights: any; requiredHackingSkill: number; }) =>
        server.hasAdminRights && server.requiredHackingSkill <= currskill
    )
    .forEach(function (server: { moneyMax: any; hostname: string; }) {
      writeOutFixedLength(
        humanReadableNumbers(server.moneyMax) +
          " ".repeat(5) +
          server.hostname.padEnd(20, " ")
      );
    });
}
