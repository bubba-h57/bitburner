let porthacks = [
  { filename: "BruteSSH.exe", apiCall: "brutessh", message: "SSH Port" },
  { filename: "relaySMTP.exe", apiCall: "relaysmtp", message: "SMTP Port" },
  { filename: "FTPCrack.exe", apiCall: "ftpcrack", message: "FTP Port" },
  { filename: "HTTPWorm.exe", apiCall: "httpworm", message: "HTTP Port" },
  { filename: "SQLInject.exe", apiCall: "sqlinject", message: "SQL Port" },
];

export function portsWeCanHack(ns) {
  let count = 0;
  porthacks.forEach(function (hack) {
    count += ns.fileExists(hack.filename) ? 1 : 0;
  });
  return count;
}

/**
 *
 * @param {import("../").NS} ns
 * @param {string} hostname
 */
export async function openPorts(ns, hostname) {
  porthacks.forEach(async function (hack) {
    ns.disableLog(hack.apiCall);
    if (ns.fileExists(hack.filename)) {
      await ns[hack.apiCall](hostname);
    }
  });
}
