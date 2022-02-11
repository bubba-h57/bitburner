import { CrimeStats, NS } from "Bitburner";

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
        "heist",
        "assassination",
        "kidnap",
        "grand theft auto",
        "homicide",
        "larceny",
        "mug someone",
        "rob store",
        "shoplift",
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
                (crimeStats.money * Math.log10(crimeChance / (1 - crimeChance + Number.EPSILON))) /
                crimeStats.time;

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
        this.ns.tprint(
            `Crime: ${bestCrime.name} Risk Value: ${bestCrime.risk.toPrecision(3)} Cash to Earn: \$${this.ns
                .getCrimeStats(bestCrime.name)
                .money.toPrecision(4)}`
        );
    }
}
