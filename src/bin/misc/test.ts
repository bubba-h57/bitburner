import { NS } from 'Bitburner';
import { cachedScan } from '/lib/Caching/functions';

export async function main(ns: NS) {
  ns.tprint('home: ' + (await cachedScan(ns)));
  ns.tprint('n00dles: ' + (await cachedScan(ns, 'n00dles')));
}
