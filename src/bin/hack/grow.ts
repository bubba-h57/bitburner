import { NS } from 'Bitburner';

export async function main(ns: NS) {
  await ns.grow(ns.args[0].toString());
}
