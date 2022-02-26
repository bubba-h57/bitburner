import { NS } from 'Bitburner';
import { config } from '/lib/Config';

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
  let level: string = 'initial';
  let shouldContinue: boolean = true;

  if (flags.initial) {
    level = 'initial';
  }

  if (flags.advanced) {
    level = 'advanced';
  }

  if (ns.getPlayer().location !== city) {
    if (ns.getPlayer().money > 200000) {
      ns.print(`Traveling to ${city}.`);
      ns.travelToCity(city);
    }
  }

  if (city === locations[0].city) {
    city = locations[0].city;
    gym = locations[0].gym;
  }

  if (city === locations[1].city) {
    city = locations[1].city;
    gym = locations[1].gym;
  }
  if (city === locations[2].city) {
    city = locations[2].city;
    gym = locations[2].gym;
  }
  let university = config(`universities.locations.${city.replace('-', '')}`);

  ns.print(`${level} training in ${city} at ${gym} & ${university}.`);

  while (shouldContinue) {
    shouldContinue = await next(ns, level, gym, university);
  }
}

async function next(ns: NS, level: string, gym: string, university: string): Promise<boolean> {
  let physical = config('gyms.statistics').reduce((previous: string, current: string) => {
    return ns.getPlayer()[current] <= ns.getPlayer()[previous] ? current : previous;
  });

  let mental = 'charisma'; //ns.getPlayer()['hacking'] <= ns.getPlayer()['charisma'] ? 'hacking' : 'charisma';

  if (
    ns.getPlayer()[mental] < ns.getPlayer()[physical] &&
    ns.getPlayer()[mental] < config(`universities.levels.${level}.${mental}`)
  ) {
    ns.universityCourse(university, config(`universities.statistics.${mental}`));
    await ns.sleep(config('universities.training.interval'));
    return true;
  }

  if (ns.getPlayer()[physical] < config(`gyms.levels.${level}.${physical}`)) {
    ns.gymWorkout(gym, physical);
    await ns.sleep(config('gyms.training.interval'));
    return true;
  }

  return false;
}
