import { NS } from 'Bitburner';

export async function main(ns: NS) {
  let cacheHandle = ns.args[0].toString();
  let host = ns.args[1].toString();
  ns.scan(host);
  let servers = await ns.scan(host);
  ns.write(cacheHandle, [JSON.stringify(servers)], 'w');
}
