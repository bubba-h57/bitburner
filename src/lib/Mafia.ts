import { NS, GangGenInfo, GangMemberInfo, Gang, GangTaskStats } from "Bitburner";
import { nameGenerator } from "/lib/Names.js";
import { Mobster } from "/lib/Mobster.js";
import { Territory } from "/lib/Territory.js";

export class Mafia {

    public ns: NS;
    public gang: Gang;
    public updateInterval: number;
    public territory: Territory;
    public maxMembers: number = 12;
    public percentOfRespectToSpendOnRecruitment: number = 0.75;
    public ascendThreshold: number = 1.05;
    public ascendThresholdIncrement: number = 0.05;

    /** Don't let the wanted penalty get worse than this */
    protected wantedPenaltyThreshold: number = 0.0001;

    constructor(ns: NS, ascend: boolean = false, updateInterval: number = 200) {
        this.ns = ns;
        this.gang = this.ns.gang;
        this.updateInterval = updateInterval;
        this.territory = new Territory(ns, this);
    }

    public manage(): void {
        // if (this.territory.warfare()) {
        //     return;
        // }

        this.mobsters().forEach(mobster => {
            mobster.work();
            mobster.ascend();
        });
    }

    public moneyAvailable(): number {
        return this.ns.getServerMoneyAvailable("home");
    }

    public info(): GangGenInfo {
        return this.gang.getGangInformation();
    }

    public mobsters(): Mobster[] {
        return this.gang.getMemberNames()
            .map((name: string, index: number) => new Mobster(this.ns, this, this.gang.getMemberInformation(name), index));
    }

    public nextMemberRespectCost(): number {
        return Math.pow(5, this.mobsters.length - (3 /*numFreeMembers*/ - 1));
    }

    public recruit(): void {
        while (this.gang.canRecruitMember() &&
            this.mobsters.length < this.maxMembers &&
            this.info().respect * this.percentOfRespectToSpendOnRecruitment > this.nextMemberRespectCost()
        ) {
            let name = this.getName();
            if (this.gang.recruitMember(name)) {
                this.ns.print(`${new Date().toISOString()} Successfully Recruited ${name}.`);
            }
        }
    }

    protected getName(): string {
        let name = nameGenerator();
        let used = this.mobsters().map((mobster: Mobster) => mobster.name);
        while (used.includes(name)) {
            name = nameGenerator();
        }
        return name;
    }

    protected gangInfo(): GangGenInfo {
        return this.gang.getGangInformation();
    }

    get myFaction(): string {
        return this.gangInfo().faction;
    }

    public requiredReputation() {
        let ns = this.ns;
        return this.availableAugments()
            .reduce((maxReputation: number, augmentation: string) =>
                Math.max(maxReputation, ns.getAugmentationRepReq[augmentation]
                ), -1);
    }

    public myAugments(): string[] {
        return this.ns.getOwnedAugmentations(true);
    }

    public availableAugments(): string[] {
        let myAugments: string[] = this.myAugments();
        return this.factionAugments()
            .filter(function (augmentation: string) {
                return myAugments.includes(augmentation) && augmentation != "The Red Pill"
            })
    }

    public factionAugments(): string[] {
        return this.ns.getAugmentationsFromFaction(this.myFaction);
    }

    public optimalStat() {
        if (this.ns.getFactionRep(this.myFaction) > this.requiredReputation()) {
            return "money";
        }

        if (this.moneyAvailable() > 1E11 || this.gangInfo().respect < 9000) {
            return "respect";
        }

        return "both money and respect";
    }

    public wantedGainTolerance() {
        // Note, until we have ~200 respect, the best way to recover from wanted penalty is to focus on gaining respect, rather than doing vigilante work.
        if (this.gangInfo().wantedPenalty < -1.1 * this.wantedPenaltyThreshold &&
            this.gangInfo().wantedLevel >= (1.1 + this.gangInfo().respect / 1000) &&
            this.gangInfo().respect > 200) {

            /* Recover from wanted penalty */
            return -0.01 * this.gangInfo().wantedLevel
        }
        if (this.currentWantedPenalty() < -0.9 * this.wantedPenaltyThreshold && this.gangInfo().wantedLevel >= (1.1 + this.gangInfo().respect / 10000)) {
            /* Sustain */
            return 0;
        }
        /* Allow wanted to increase at a manageable rate */
        return Math.max(this.gangInfo().respectGainRate / 1000, this.gangInfo().wantedLevel / 10);
    }

    protected currentWantedPenalty() {
        return this.getWantedPenalty() - 1;
    }

    public getWantedPenalty() {
        return this.gangInfo().respect / (this.gangInfo().respect + this.gangInfo().wantedLevel);
    }

}
