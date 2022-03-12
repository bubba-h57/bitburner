import { CrimeStats, NS } from 'Bitburner';
import { exec, formatMoney } from '/lib/Helpers';
import { config } from '/lib/Config';

export interface ICrimeRisk {
  name: string;
  risk: number;
}

export class CrimeRisk implements ICrimeRisk {
  name: string;
  risk: number;
  constructor(name: string, risk: number) {
    this.name = name;
    this.risk = risk;
  }
}
export class Crimes {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  async calculateRisk(): Promise<CrimeRisk[]> {
    return config('crime.activities').map(async (crime: string) => {
      let crimeStats: CrimeStats = await exec(this.ns, '/opt/crime/bin/getCrimeStats', 3, [crime]);
      let crimeChance: number = await exec(this.ns, '/opt/crime/bin/getCrimeChance', 3, [crime]);

      let crimeRiskValue: number =
        (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) / crimeStats.time;

      return new CrimeRisk(crime, crimeRiskValue);
    });
  }

  async chooseBestCrime(): Promise<CrimeRisk> {
    return (await this.calculateRisk()).reduce((prev: CrimeRisk, current: CrimeRisk) => {
      return prev.risk > current.risk ? prev : current;
    });
  }

  async commitBestCrime(): Promise<void> {
    let bestCrime = await this.chooseBestCrime();
    this.ns.commitCrime(bestCrime.name);
    let stats = await exec(this.ns, '/opt/crime/bin/getCrimeStats', 3, [bestCrime.name]);
    let cash = formatMoney(stats.money * this.ns.getBitNodeMultipliers().CrimeMoney);

    this.ns.print(`${bestCrime.name} to Earn: ${cash}`);
  }

  async murderHobo(): Promise<void> {
    this.ns.commitCrime('Homicide');
    let stats = await exec(this.ns, '/opt/crime/bin/getCrimeStats', 3, ['Homicide']);
    let cash = formatMoney(stats.money * this.ns.getBitNodeMultipliers().CrimeMoney);

    this.ns.print(`Commiting Homicide to Earn: ${cash}`);
  }

  async muggerHobo(): Promise<void> {
    this.ns.commitCrime('Mug');
    let stats = await exec(this.ns, '/opt/crime/bin/getCrimeStats', 3, ['Mug']);
    let cash = formatMoney(stats.money * this.ns.getBitNodeMultipliers().CrimeMoney);

    this.ns.print(`Commiting Mug to Earn: ${cash}`);
  }
}
