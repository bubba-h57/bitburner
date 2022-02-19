import { NS } from 'Bitburner';
import { config } from '/lib/Config.js';
import { compare } from '/lib/Helpers';

const argsSchema: [string, boolean][] = [
  ['initial', true],
  ['advanced', false],
];

export async function main(ns: NS) {
  ns.tail();
  let flags = ns.flags(argsSchema);
  let locations: any[] = config('gyms.locations');
  let city: string = locations[0].city;
  let gym: string = locations[0].gym;
  let stat: string = '';
  let level: string = '';

  if (flags.initial) {
    level = 'initial';
  }

  if (flags.advanced) {
    level = 'advanced';
  }

  ns.print(`Training to ${level} level.`);

  if (ns.getPlayer().location !== city) {
    if (ns.getPlayer().money > 200000) {
      ns.travelToCity(city);
    } else if (locations.some((gym) => compare(gym.location, ns.getPlayer().location))) {
      city = locations.find((gym) => compare(gym.location, ns.getPlayer().location)).city;
      gym = locations.find((gym) => compare(gym.location, ns.getPlayer().location)).gym;
    } else {
      ns.tprint('ERROR: No gym available at the moment');
    }
  }

  stat = next(ns);
  while (ns.getPlayer()[stat] < config(`gyms.levels.${level}.${stat}`)) {
    ns.gymWorkout(gym, stat);
    await ns.sleep(config('gyms.training.interval'));
    stat = next(ns);
  }
}

function next(ns: NS): string {
  return config('gyms.statistics').reduce((previous: string, current: string) => {
    return ns.getPlayer()[current] <= ns.getPlayer()[previous] ? current : previous;
  });
}