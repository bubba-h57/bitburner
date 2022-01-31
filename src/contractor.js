import { getAllServers } from "lib/servers.js";
import { contractWorkers } from "lib/contracts.js";

/** @param {import(".").NS } ns */
export function main(ns) {
  const servers = getAllServers(ns, "home");
  let hostnameLength = 0;
  let contractLength = 0;
  let contractTypeLength = 0;
  let contracts = [];

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

  ns.tprintf(`Found ${contracts.length} contracts.`);
  contracts.forEach(async function (contract) {
    let solution = await solve(contract, ns);
    let output = [
      contract.hostname.padEnd(hostnameLength + 3, " ") +
        contract.filename.padEnd(contractLength + 3, " ") +
        contract.type.padEnd(contractTypeLength + 3, " "),
      solution,
    ].join("");
    ns.tprintf(output);
  });
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
