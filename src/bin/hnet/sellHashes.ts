import { NS } from 'Bitburner';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  if (ns.hacknet.spendHashes('Generate Coding Contract')) {
    ns.tprint('Purchased a Contract!');
  }
  ns.print('Num Hashes: ' + ns.hacknet.numHashes());
  ns.print('  Capacity: ' + ns.hacknet.hashCapacity());
  ns.print(' Threshold: ' + ns.hacknet.hashCapacity() * 0.75);
  if (ns.hacknet.numHashes() > ns.hacknet.hashCapacity() * 0.75) {
    let $continue = true;
    while ($continue) {
      if (ns.hacknet.numHashes() > 100) {
        ns.hacknet.spendHashes('Sell for Money');
      } else {
        $continue = false;
      }
      await ns.asleep(100);
    }
  }
}
