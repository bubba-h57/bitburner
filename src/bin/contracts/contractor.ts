import { getAllServers } from '/lib/Servers.js';
import { codingContractTypes } from '/lib/Contracts.js';
import { NS } from 'Bitburner';

export async function main(ns: NS) {
  const servers = getAllServers(ns, 'home');
  let hostnameLength = 20;
  let contractLength = 35;
  let contractTypeLength = 0;
  let contracts: CodingContractMeta[] = [];

  class CodingContractMeta {
    hostname: string;
    filename: string;
    type: string;

    constructor(hostname: string, filename: string, type: string) {
      this.hostname = hostname;
      this.filename = filename;
      this.type = type;
    }
  }

  servers.forEach(function (hostname) {
    ns.ls(hostname, '.cct').forEach(function (contractFilename: string) {
      hostnameLength = compareNumbers(hostname.length, hostnameLength);
      contractLength = compareNumbers(contractFilename.length, contractLength);
      const type: string = ns.codingcontract.getContractType(contractFilename, hostname);
      contractTypeLength = compareNumbers(type.length, contractTypeLength);
      contracts.push(new CodingContractMeta(hostname, contractFilename, type));
    });
  });

  for (let index = 0; index < contracts.length; index++) {
    let solution = await solve(contracts[index], ns);
    let result = solution !== '' ? '  SOLVED   ' : 'UNSOLVED   ';
    let output = [
      contracts[index].hostname.padEnd(hostnameLength + 3, ' '),
      result.padEnd(3, ' '),
      contracts[index].filename.padEnd(contractLength + 3, ' '),
      contracts[index].type.padEnd(contractTypeLength + 3, ' '),
      solution,
    ].join('');
  }
}

function compareNumbers(original: number, challenger: number) {
  return original > challenger ? original : challenger;
}

/** @param {NS} ns */
async function solve(
  contract: { type?: any; filename?: any; hostname?: any },
  ns: {
    codingcontract: {
      getData: (arg0: any, arg1: any) => any;
      attempt: (arg0: any, arg1: any, arg2: any, arg3: { returnReward: boolean }) => any;
    };
  }
) {
  let worker = findWorker(contract.type);
  let data = await ns.codingcontract.getData(contract.filename, contract.hostname);
  let answer = worker?.answer(data);

  return ns.codingcontract.attempt(answer, contract.filename, contract.hostname, {
    returnReward: true,
  });
}

function findWorker(type: string) {
  return codingContractTypes.find((worker) => worker.name.toUpperCase() === type.toUpperCase());
}
