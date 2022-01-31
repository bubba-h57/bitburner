/** @type import(".").NS */
export async function main(ns) {
  const ONE_MINUTE = 60000;

  let jobs = [
    { script: "sudo.js", delay: ONE_MINUTE * 20, lastrun: performance.now() },
    {
      script: "contractor.js",
      delay: ONE_MINUTE * 20,
      lastrun: performance.now(),
    },
  ];

  while (true) {
    let elapsedTime = 0;

    jobs.forEach(async function (job) {
      elapsedTime = performance.now() - job.lastrun;
      if (elapsedTime > job.delay) {
        await ns.exec(job.script, "home");
      }
    });

    await ns.sleep(ONE_MINUTE);
  }
}
