import { NS } from 'Bitburner';

var ns: NS;
var port: number;

export async function main(bubbaNS: NS) {
  // Sets our global NS var
  globalThis.ns = bubbaNS;
  // Set a global port var
  globalThis.port = 3;
}
