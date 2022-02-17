import { CrimeStats, NS } from 'Bitburner';
import { humanReadable, formatMoney } from '/lib/Helpers.js';

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
  crimes: string[] = [
    'Heist',
    'Assassination',
    'Kidnap',
    'Grand Theft Auto',
    'Homicide',
    'Traffick Arms',
    // 'Bond Forgery',
    // 'Deal Drugs',
    'Larceny',
    'Mug',
    'Rob Store',
    'Shoplift',
  ];
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  calculateRisk(): CrimeRisk[] {
    return this.crimes.map((crime) => {
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
    let cash = formatMoney(this.ns.getCrimeStats(bestCrime.name).money);
    this.ns.print(`${bestCrime.name} to Earn: ${cash}`);
  }
}
