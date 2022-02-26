import { CrimeStats, NS } from 'Bitburner';
import { formatMoney } from '/lib/Helpers.js';
import { config } from '/lib/Config.js';

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

  calculateRisk(): CrimeRisk[] {
    return config('crime.activities').map((crime) => {
      let crimeStats: CrimeStats = this.ns.getCrimeStats(crime);
      let crimeChance: number = this.ns.getCrimeChance(crime);

      let crimeRiskValue: number =
        (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) / crimeStats.time;

      return new CrimeRisk(crime, crimeRiskValue);
    });
  }

  chooseBestCrime(): CrimeRisk {
    return this.calculateRisk().reduce((prev: CrimeRisk, current: CrimeRisk) => {
      return prev.risk > current.risk ? prev : current;
    });
  }

  commitBestCrime(): void {
    let bestCrime = this.chooseBestCrime();
    this.ns.commitCrime(bestCrime.name);
    let cash = formatMoney(this.ns.getCrimeStats(bestCrime.name).money * this.ns.getBitNodeMultipliers().CrimeMoney);

    this.ns.print(`${bestCrime.name} to Earn: ${cash}`);
  }

  murderHobo(): void {
    this.ns.commitCrime('Homicide');
    let cash = formatMoney(this.ns.getCrimeStats('Homicide').money * this.ns.getBitNodeMultipliers().CrimeMoney);

    this.ns.print(`Homicide to Earn: ${cash}`);
  }
}
