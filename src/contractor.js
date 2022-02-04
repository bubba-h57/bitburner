import { getAllServers } from "lib/servers.js";
import { contractWorkers } from "lib/contracts.js";
import { Logger } from "lib/logger.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  const servers = getAllServers(ns, "home");
  let hostnameLength = 20;
  let contractLength = 35;
  let contractTypeLength = 0;
  let contracts = [];

  /** @type {import("./lib/logger").Logger} */
  let logger = await new Logger(ns, "/logs/contracts.txt");

  servers.forEach(function (hostname) {
    ns.ls(hostname, ".cct").forEach(function (contract) {
      hostnameLength = compareNumbers(hostname.length, hostnameLength);
      contractLength = compareNumbers(contract.length, contractLength);
      const type = ns.codingcontract.getContractType(contract, hostname);

      contractTypeLength = compareNumbers(type.length, contractTypeLength);
      contracts.push({
        hostname: hostname,
        filename: contract,
        type: type,
      });
    });
  });

  for (let index = 0; index < contracts.length; index++) {
    let solution = await solve(contracts[index], ns);
    let result = solution !== "" ? "  SOLVED" : "UNSOLVED";
    let output = [
      contracts[index].hostname.padEnd(hostnameLength + 3, " "),
      result.padEnd(3, " "),
      contracts[index].filename.padEnd(contractLength + 3, " "),
      contracts[index].type.padEnd(contractTypeLength + 3, " "),
      solution,
    ].join("");

    await logger.write(output);
  }
}

function compareNumbers(original, challenger) {
  return original > challenger ? original : challenger;
}

/** @param {import(".").NS } ns */
async function solve(contract, ns) {
  let worker = findWorker(contract.type);
  let data = await ns.codingcontract.getData(
    contract.filename,
    contract.hostname
  );
  let answer = worker.work(data);

  return ns.codingcontract.attempt(
    answer,
    contract.filename,
    contract.hostname,
    {
      returnReward: true,
    }
  );
}

function findWorker(type) {
  return contractWorkers.find(
    (worker) => worker.name.toUpperCase() === type.toUpperCase()
  );
}
