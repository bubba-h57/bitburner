import { humanReadableNumbers } from "lib/helpers.js";
import { writeOutFixedLength, hasFlag } from "lib/term.js";
import { getServerInfo } from "lib/servers.js";

/**
 * Crawls through the entire network and presents
 * the inventory of servers in nice formats.
 *
 *  --money      Will give you the list of servers in order of max money
 *  --backdoors  Will provide a list of servers that you could install backdoors on, but haven't yet.
 *
 * @param {import(".").NS } ns
 * @returns null
 */
export async function main(ns) {
  let servers = getServerInfo(ns);

  if (hasFlag(ns, "--money")) {
    return orderByMoney(servers, ns.getHackingLevel());
  }
  if (hasFlag(ns, "--backdoors")) {
    return findBackdoors(servers, ns.getHackingLevel());
  }

  orderDefault(servers);
}

/**
 * Just prints out the list in alphabetical order.
 *
 * @param {import(".").Server[] } servers
 */
function orderDefault(servers) {
  servers
    .sort(function (a, b) {
      let aHostname = a.hostname.toUpperCase();
      let bHostname = b.hostname.toUpperCase();
      return aHostname < bHostname ? -1 : aHostname > bHostname ? 1 : 0;
    })
    .forEach((server) => writeOutFixedLength("  - " + server.hostname));
}

/**
 * Prints a list of servers that you could backdoor.
 *
 * @param {import(".").Server[] } servers
 * @param {number} currskill
 */
function findBackdoors(servers, currskill) {
  servers
    .filter(function (server) {
      return (
        server.hasAdminRights &&
        !server.backdoorInstalled &&
        server.requiredHackingSkill <= currskill
      );
    })
    .forEach(function (server) {
      writeOutFixedLength(server.hostname);
    });
}

/**
 * Prints a list of server in order of most profitable descending.
 *
 * @param {import(".").Server[] } servers
 */
function orderByMoney(servers, currskill) {
  servers
    .sort((a, b) => b.moneyMax - a.moneyMax)
    .filter(
      (server) =>
        server.hasAdminRights && server.requiredHackingSkill <= currskill
    )
    .forEach(function (server) {
      writeOutFixedLength(
        humanReadableNumbers(server.moneyMax) +
          " ".repeat(5) +
          server.hostname.padEnd(20, " ")
      );
    });
}
