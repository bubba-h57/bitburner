import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let $continue = true;
  let $seconds: number = 4 * 1000;

  while ($continue) {
    await sellHashForMoney(ns, true);
    await ns.asleep($seconds);
  }
}

async function sellHashForMoney(ns: NS, loop: boolean = true) {
  if (ns.hacknet.spendHashes('Sell for Corporation Funds')) {
    await ns.asleep(10);
    await sellHashForMoney(ns, loop);
  }
}
