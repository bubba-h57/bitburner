import { NS} from "Bitburner";
import { humanReadableNumbers, humanReadableByteSize } from "/lib/Helpers";

/** @param NS } ns */
export async function main(ns: NS) {
  const maxPurchasableRam = 1048576;
  let ram = 2;
  ns.disableLog("disableLog");
  ns.disableLog("sleep");
  ns.tail();

  for (let i = 1; i <= 20; i++) {
    ram = Math.pow(2, i);
    // Server purchase info
    let serverPrice = ns.getPurchasedServerCost(ram);
    let price = humanReadableNumbers(serverPrice);

    ns.print(`{"ram":${ram}, "cost": "${price}"}`);
    await ns.sleep(300);
  }
}
