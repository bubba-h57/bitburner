import { NS } from 'Bitburner';
import { openPorts } from '/lib/Ports.js';

const weaken = '/bin/hack/weaken.js';
const grow = '/bin/hack/grow.js';
const hack = '/bin/hack/hack.js';
const share = '/bin/hack/share.js';
const ONE_MINUTE = 60000;
const files = [weaken, grow, hack];

const singularityFunctionsAvailable = true;
const backdoorScript = '/bin/backdoor.js';
const backdoorScriptRam = 65.8;

let jobs = [
  {
    script: `${backdoorScript} faction`,
    delay: ONE_MINUTE * 20,
    lastrun: performance.now(),
  },
];

export async function main(ns: NS) {}
