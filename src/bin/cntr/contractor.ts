import { NS } from 'Bitburner';
import { getAllServers } from '/lib/Servers';
import { compareNumbers, CodingContractMeta, solve } from '/lib/Contracts';

export async function main(ns: NS) {
  const servers = await getAllServers(ns, 'home');
  let hostnameLength = 20;
  let contractLength = 35;
  let contractTypeLength = 0;
  let contracts: CodingContractMeta[] = [];

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
    let solution = await solve(ns, contracts[index]);
    let result = solution !== '' ? '  SOLVED   ' : 'UNSOLVED   ';
    let output = [
      contracts[index].hostname.padEnd(hostnameLength + 3, ' '),
      result.padEnd(3, ' '),
      contracts[index].filename.padEnd(contractLength + 3, ' '),
      contracts[index].type.padEnd(contractTypeLength + 3, ' '),
      solution,
    ].join('');
    ns.tprint(output);
  }
}
