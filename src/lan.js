import { humanReadableNumbers } from "lib/helpers.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  for (let i = 5; i <= 25; i++) ns.purchaseServer("bubba-net-" + i, 8192 * 2); // 16 tb
}
