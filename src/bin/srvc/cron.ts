import { NS } from 'Bitburner';

export async function main(ns: NS) {
  const ONE_MINUTE = 60000 * 0.1;
  ns.disableLog('ALL');
  let jobs = [
    {
      script: 'bin/netw/sudo.js',
      delay: ONE_MINUTE * 20,
      lastrun: performance.now(),
    },
    {
      script: '/bin/cntr/contractor.js',
      delay: ONE_MINUTE * 20,
      lastrun: performance.now(),
    },
    {
      script: '/bin/hack/hacker.js',
      delay: ONE_MINUTE * 90,
      lastrun: performance.now(),
    },
    {
      script: '/bin/hnet/sellHashes.js',
      delay: ONE_MINUTE * 0.25,
      lastrun: performance.now(),
    },
  ];

  while (true) {
    let elapsedTime = 0;

    for (let index = 0; index < jobs.length; index++) {
      elapsedTime = performance.now() - jobs[index].lastrun;

      if (elapsedTime > jobs[index].delay) {
        ns.print('Executing: ' + jobs[index].script);
        ns.exec(jobs[index].script, 'home');
        jobs[index].lastrun = performance.now();
      }
    }

    await ns.sleep(ONE_MINUTE);
  }
}
