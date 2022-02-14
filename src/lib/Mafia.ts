import { NS, GangGenInfo, GangMemberInfo, Gang, GangTaskStats } from 'Bitburner';
import { nameGenerator } from '/lib/Names.js';
import { Mobster } from '/lib/Mobster.js';
import { Territory } from '/lib/Territory.js';
import { formatNumberShort } from '/lib/Helpers.js';
export class Mafia {
  public ns: NS;
  public gang: Gang;
  public updateInterval: number;
  public territory: Territory;
  public maxMembers: number = 12;
  public percentOfRespectToSpendOnRecruitment: number = 0.75;
  public ascendThreshold: number = 1.05;
  public ascendThresholdIncrement: number = 0.05;
  public territoryEngageThreshold: number = 0.65;
  protected lowestWinChance = 1;
  protected totalWinChance = 0;
  protected totalActiveGangs = 0;
  protected lowestWinChanceGang = '';
  protected averageWinChance = 0;

  /** Don't let the wanted penalty get worse than this */
  protected wantedPenaltyThreshold: number = 0.0001;

  constructor(ns: NS, ascend: boolean = false, updateInterval: number = 200) {
    this.ns = ns;
    this.gang = this.ns.gang;
    this.updateInterval = updateInterval;
    this.territory = new Territory(ns, this);
  }

  public manage(): void {
    this.warfare();
    if (this.territory.warfare()) {
      return;
    }

    this.mobsters().forEach((mobster) => {
      mobster.work();
      mobster.ascend();
    });
  }

  public moneyAvailable(): number {
    return this.ns.getServerMoneyAvailable('home');
  }

  public info(): GangGenInfo {
    return this.gang.getGangInformation();
  }

  public mobsters(): Mobster[] {
    return this.gang
      .getMemberNames()
      .map((name: string, index: number) => new Mobster(this.ns, this, this.gang.getMemberInformation(name), index));
  }

  public nextMemberRespectCost(): number {
    return Math.pow(5, this.mobsters.length - (3 /*numFreeMembers*/ - 1));
  }

  public recruit(): void {
    while (
      this.gang.canRecruitMember() &&
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

  public gangInfo(): GangGenInfo {
    return this.gang.getGangInformation();
  }

  get myFaction(): string {
    return this.gangInfo().faction;
  }

  public requiredReputation() {
    let ns = this.ns;
    if (this.availableAugments().length < 1) {
      return 0;
    }
    let result = this.availableAugments().reduce(
      (maxReputation: number, augmentation: string) => Math.max(maxReputation, ns.getAugmentationRepReq[augmentation]),
      -1
    );
    if (isNaN(result)) {
      result = 0;
    }
    return result;
  }

  public myAugments(): string[] {
    return this.ns.getOwnedAugmentations(true);
  }

  public availableAugments(): string[] {
    let myAugments: string[] = this.myAugments();
    return this.factionAugments().filter(function (augmentation: string) {
      return myAugments.includes(augmentation) && augmentation != 'The Red Pill';
    });
  }

  public factionAugments(): string[] {
    return this.ns.getAugmentationsFromFaction(this.myFaction);
  }

  public optimalStat() {
    if (this.ns.getFactionRep(this.myFaction) > this.requiredReputation()) {
      return 'money';
    }

    if (this.moneyAvailable() > 1e11 || this.gangInfo().respect < 9000) {
      return 'respect';
    }
    return 'both money and respect';
  }

  public wantedGainTolerance() {
    // Note, until we have ~200 respect, the best way to recover from wanted penalty is to focus on gaining respect, rather than doing vigilante work.
    if (
      this.gangInfo().wantedPenalty < -1.1 * this.wantedPenaltyThreshold &&
      this.gangInfo().wantedLevel >= 1.1 + this.gangInfo().respect / 1000 &&
      this.gangInfo().respect > 200
    ) {
      /* Recover from wanted penalty */
      return -0.01 * this.gangInfo().wantedLevel;
    }
    if (
      this.currentWantedPenalty() < -0.9 * this.wantedPenaltyThreshold &&
      this.gangInfo().wantedLevel >= 1.1 + this.gangInfo().respect / 10000
    ) {
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

  protected finishedWarfare(): boolean {
    return Math.round(this.gangInfo().territory * 2 ** 20) / 2 ** 20 /* Handle API imprecision */ >= 1;
  }

  public warfare() {
    if (this.finishedWarfare()) {
      if (this.gangInfo().territoryWarfareEngaged) {
        this.gang.setTerritoryWarfare(false);
      }
      return;
    }

    let makeWar = this.makeWar();
    if (makeWar != this.makingWar()) {
      this.ns.print(`Toggling participation in territory warfare to ${makeWar}.`);
      this.ns.print(`Our power: ${formatNumberShort(this.power())}.`);
      this.ns.print(
        `Lowest chance to win is ${(100 * this.lowestWinChance).toFixed(2)}% with ${
          this.lowestWinChanceGang
        } (power ${formatNumberShort(this.gang.getOtherGangInformation()[this.lowestWinChanceGang]?.power)}).`
      );
      this.ns.print(
        `Average chance to win is ${(100 * this.averageWinChance).toFixed(2)}% across ${
          this.totalActiveGangs
        } active gangs.`
      );
      this.gang.setTerritoryWarfare(makeWar);
    }
  }

  protected power(): number {
    return this.gangInfo().power;
  }

  public makingWar(): boolean {
    return this.gangInfo().territoryWarfareEngaged;
  }
  protected makeWar(): boolean {
    return this.territoryEngageThreshold <= this.warWinChance();
  }

  protected reset(): void {
    this.lowestWinChance = 1;
    this.totalWinChance = 0;
    this.totalActiveGangs = 0;
    this.lowestWinChanceGang = '';
    this.averageWinChance = 0;
  }

  protected warWinChance(): number {
    const otherGangs = this.gang.getOtherGangInformation();
    this.reset();

    for (const otherGang in otherGangs) {
      if (otherGangs[otherGang].territory == 0 || otherGang == this.gangInfo().faction) {
        continue;
      }
      const winChance = this.gangInfo().power / (this.gangInfo().power + otherGangs[otherGang].power);
      if (winChance <= this.lowestWinChance) {
        this.lowestWinChanceGang = otherGang;
      }
      this.totalActiveGangs++;
      this.totalWinChance += winChance;
      this.lowestWinChance = Math.min(this.lowestWinChance, winChance);
    }
    this.averageWinChance = this.totalWinChance / this.totalActiveGangs;
    return this.averageWinChance;
  }
}
