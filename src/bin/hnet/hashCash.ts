import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let $continue = true;
  let $seconds: number = 8 * 1000;
  ns.tail();

  while ($continue) {
    await sellHashForMoney(ns, true);
    await ns.asleep($seconds);
  }
}

async function sellHashForMoney(ns: NS, loop: boolean = true): Promise<number> {
  let count: number = 0;
  if (ns.hacknet.spendHashes('Sell for Money')) {
    count++;
    await ns.asleep(100);
    count += await sellHashForMoney(ns, loop);
  }
  return count;
}
