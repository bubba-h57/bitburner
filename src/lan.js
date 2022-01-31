import { humanReadableNumbers } from "lib/helpers.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  // hardcoded max servers as of Bitburner v1.3
  const MAX_PURCHASABLE = 25;
  // String to Prepend to purchased servers hostname, followed by a number
  const SVRNAME = "net-";
  // Minimum RAM, in Gigabytes
  const MIN_RAM = 32000;
  // Target RAM for server is "Home" RAM, divided by SVR_RAM_RATIO, must = power of 2
  const SVR_RAM_RATIO = 2;
  let currentServers = ns.getPurchasedServers();
  let ram = calculateRam();
  let i = currentServers.length;
  let running = true;

  // Server purchase info
  const serverPriceInfoText = (
    ns.getPurchasedServerCost(ram) / 1000000
  ).toFixed(2);

  ns.tprintf(`Server price is ${serverPriceInfoText} M.`);
  ns.print(`Buying ${ram}GB servers for ${serverPriceInfoText} M.`);

  // then Continuously try to purchase servers until we've reached the maximum
  while (i < MAX_PURCHASABLE) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      // if sufficient money, buy server, name it, upload scripts and exec MAIN_SCRIPT
      let hostname = ns.purchaseServer(
        SVRNAME + i.toString().padStart(2, "0"),
        ram
      );

      ns.tprintf(`Server ${hostname} was purchased.`);
      ns.print(`Server ${hostname} was purchased.`);
      ++i;
    } else {
      ns.print(
        `Need more money, the current price is ${serverPriceInfoText} M`
      );
      await ns.sleep(20000);
    }
  }

  // Calculate how much RAM to buy for the server
  function calculateRam() {
    const homeRam = ns.getServerMaxRam("home");
    // Hardcoded value for maximum purchasable server ram @ Bitburner v1.3
    const maxPurchasableRam = 1048576;

    if (homeRam > maxPurchasableRam) {
      return maxPurchasableRam;
    } else if (homeRam <= MIN_RAM) {
      return MIN_RAM;
    } else {
      return homeRam / SVR_RAM_RATIO;
    }
  }
}
