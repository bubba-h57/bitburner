import { GangMemberInfo, NS } from 'Bitburner';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  while (true) {
    let power: number = calculateGangPower(ns);
    ns.print(`Estimated Power: ${power} \t\t Actual Power: ${ns.gang.getGangInformation().power}`);
    await ns.sleep(5000);
  }
}

function calculatePower(member: GangMemberInfo): number {
  return (member.hack + member.str + member.def + member.dex + member.agi + member.cha) / 95;
}

//Calculates power GAIN, which is added onto the Gang's existing power
function calculateGangPower(ns: NS): number {
  let names: string[] = ns.gang.getMemberNames();
  let members: GangMemberInfo[] = names.map((name: string) => ns.gang.getMemberInformation(name));

  let memberTotal = 0;
  for (let i = 0; i < members.length; ++i) {
    memberTotal += calculatePower(members[i]);
  }

  return 0.015 * Math.max(0.002, ns.gang.getGangInformation().territory) * memberTotal;
}
