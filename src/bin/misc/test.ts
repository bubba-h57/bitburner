import { NS } from 'Bitburner';
import { config } from '/lib/Config.js';

export async function main(ns: NS) {
  ns.tprint(config('gyms'));

  ns.tprint(config('gyms.locations'));
  ns.tprint(config('gyms.locations.0'));
  ns.tprint(config('jims.locations.0', 'gym, not jim'));
}
