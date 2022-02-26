import { NS } from 'Bitburner';

/**
 * Get the list servers connected to a server.
 * @remarks
 * RAM cost: 0.2 GB
 *
 * Returns an array containing the hostnames of all servers that are one
 * node way from the specified target server. The hostnames in the returned
 * array are strings.
 *
 * @param host - Hostname of the server to scan.
 * @returns Returns an string of hostnames.
 */
export async function XcachedScan(ns: NS, host?: string): Promise<string[]> {
  host = host ?? ns.getHostname();
  let cacheHandle = `/cache/scan.${host}.json.txt`;
  let failsafe = [];
  let data = readCache(ns, cacheHandle, failsafe);
  if (data === failsafe) {
    await run(ns, cacheHandle, '/bin/cache/scan.js', 1, host);
    data = readCache(ns, cacheHandle, failsafe);
  }
  return data;
}

async function run(ns: NS, cacheHandle: string, script: string, numThreads?: number, ...args: string[]) {
  numThreads = numThreads ?? 1;
  let retryDelayMs: number = 50;
  let backoffRate: number = 3;
  let pid = ns.run(script, numThreads, cacheHandle, ...args);
  if (pid < 1) {
    throw new ErrorEvent(`Failed to run ${script}`);
  }
  // script: string, host: string, ...args: string[]
  while (ns.isRunning(pid, ns.getHostname())) {
    await ns.sleep(retryDelayMs);
    retryDelayMs *= backoffRate;
  }
}

function readCache(ns: NS, cacheHandle: string, failsafe: any) {
  let json = ns.read(cacheHandle);
  return json ? JSON.parse(json) : failsafe;
}
