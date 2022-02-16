import { NS } from 'Bitburner';
import { backdoor } from '/lib/Backdoor';

const factionServers = [
  'CSEC',
  'I.I.I.I',
  'avmnite-02h',
  'run4theh111z',
  'clarkinc',
  'nwo',
  'omnitek',
  'fulcrumtech',
  'fulcrumassets',
  'w0r1d_d43m0n',
];

export async function main(ns: NS) {
  if (ns.args.length !== 1) {
    ns.tprint('Usage: specify target server like: backdoor CSEC');
  }
  let target = ns.args[0].toString();

  let backdoorServers = [target];

  if (target === 'faction') {
    backdoorServers = factionServers;
  }

  for (let i = 0; i < backdoorServers.length; i++) {
    await backdoor(ns, backdoorServers[i]);
  }
}
