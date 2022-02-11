import { NS } from "Bitburner";

let porthacks = [
  { filename: "BruteSSH.exe", apiCall: "brutessh", message: "SSH Port" },
  { filename: "relaySMTP.exe", apiCall: "relaysmtp", message: "SMTP Port" },
  { filename: "FTPCrack.exe", apiCall: "ftpcrack", message: "FTP Port" },
  { filename: "HTTPWorm.exe", apiCall: "httpworm", message: "HTTP Port" },
  { filename: "SQLInject.exe", apiCall: "sqlinject", message: "SQL Port" },
];

export function portsWeCanHack(ns: NS) {
  let count = 0;
  porthacks.forEach(function (hack) {
    count += ns.fileExists(hack.filename) ? 1 : 0;
  });
  return count;
}

export async function openPorts(ns: NS, hostname: string) {
  porthacks.forEach(async function (hack) {
    ns.disableLog(hack.apiCall);
    if (ns.fileExists(hack.filename)) {
      await ns[hack.apiCall](hostname);
    }
  });
}
