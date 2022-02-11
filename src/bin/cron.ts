import { NS } from "Bitburner";

/** @type NS */
export async function main(ns: NS) {
  const ONE_MINUTE = 60000;

  let jobs = [
    {
      script: "/bin/sudo.js",
      delay: ONE_MINUTE * 20,
      lastrun: performance.now()
    },
    {
      script: "/bin/contractor.js",
      delay: ONE_MINUTE * 20,
      lastrun: performance.now(),
    },
    {
      script: "/bin/hacker.js",
      delay: ONE_MINUTE * 90,
      lastrun: performance.now(),
    },
  ];

  while (true) {
    let elapsedTime = 0;

    for (let index = 0; index < jobs.length; index++) {
      elapsedTime = performance.now() - jobs[index].lastrun;

      if (elapsedTime > jobs[index].delay) {
        await ns.exec(jobs[index].script, "home");
        jobs[index].lastrun = performance.now();
      }
    }

    await ns.sleep(ONE_MINUTE);
  }
}
