import { NS, GangMemberInfo, GangGenInfo, GangTaskStats, GangMemberAscension } from 'Bitburner';
import { Mafia } from '/lib/Mafia';
import { compare } from '/lib/Helpers';
import { config } from '/lib/Config';
export class Mobster {
  protected ns: NS;
  protected mafia: Mafia;
  protected info: GangMemberInfo;
  public initStr: number = 50;
  public initDef: number = 50;
  public initDex: number = 50;
  public initAgi: number = 50;
  protected assignment: string = 'Train Combat';
  public tickCounter: number = 0;
  public isTraining: boolean = false;
  public ascensionThreshold: number;
  protected index: number;

  constructor(ns: NS, mafia: Mafia, info: GangMemberInfo, index: number) {
    this.ns = ns;
    this.mafia = mafia;
    this.info = info;
    this.update();
    this.train();
    this.index = index;
    this.ascensionThreshold = mafia.ascendThreshold + (11 - index) * mafia.ascendThresholdIncrement;
  }

  get tick(): number {
    return this.tickCounter;
  }

  public incrementTick(): void {
    this.tickCounter++;
  }

  public update(): void {
    this.info = this.ns.gang.getMemberInformation(this.name);
  }

  public work(): void {
    if (!this.train()) {
      if (!this.layLow()) {
        let optStat = this.mafia.optimalStat();
        let tasks = this.tasks();

        if (optStat == 'both money and respect') {
          // Hack to support a "optimized total" stat when trying to balance both money and wanted
          tasks.forEach((task) => (task[optStat] = task.money / 1000 + task.respect));
          // Hack: Even members prioritize respect, odd money
          tasks.forEach((task, idx) =>
            tasks.sort((a, b) => (idx % 2 == 0 ? b.respect - a.respect : b.money - a.money))
          );
          let taskIndex = this.index % 2 == 0 ? 1 : 0;
          this.setTask(tasks[taskIndex].name);
        } else {
          tasks.forEach((task) => tasks.sort((a, b) => b[optStat] - a[optStat]));
          this.setTask(tasks[0].name);
        }
      }
    }
  }

  public equip(): void {
    /** Get available upgrades, then filter out what we already have. */
    let upgrades = this.equipmentAvailable().filter((x) => !this.upgrades.includes(x));
    /** Now filter out any hacking specific upgrades, we are combat gang. */
    upgrades = upgrades.filter((x) => !config('mafia.equipment.rootkit').includes(x));

    upgrades.forEach((upgrade: string) => {
      if (this.ns.gang.purchaseEquipment(this.name, upgrade)) {
        this.ns.print(`Purchased ${upgrade} for ${this.name}.`);
      }
    });
  }

  public equipmentAvailable(): string[] {
    return this.ns.gang.getEquipmentNames();
  }

  public train(): boolean {
    if (this.needsInitialCombatTraining()) {
      return this.setTask('Train Combat');
    }
    return this.needsInitialCombatTraining();
  }

  public layLow(): boolean {
    if (this.needsToLayLow()) {
      return this.setTask('Vigilante Justice');
    }
    return this.needsToLayLow();
  }

  public setTask(task: string): boolean {
    if (task === this.task) {
      return true;
    }
    // If set to Warfare, we don't mess with it. The War script will reset it when it is time.
    if (compare(task, 'Territory Warfare')) {
      return true;
    }

    return this.ns.gang.setMemberTask(this.name, task);
  }

  protected needsToLayLow(): boolean {
    let wantedPenalty = this.ns.gang.getGangInformation().wantedPenalty;
    let wantedLevel = this.ns.gang.getGangInformation().wantedLevel;

    return wantedPenalty < 0.9 && wantedLevel > 1.1;
  }

  protected needsInitialCombatTraining(): boolean {
    return this.str < this.initStr || this.def < this.initDef || this.dex < this.initDex || this.agi < this.initAgi;
  }

  get name(): string {
    return this.info.name;
  }
  get task(): string {
    return this.info.task;
  }
  get earnedRespect(): number {
    return this.info.earnedRespect;
  }
  get hack(): number {
    return this.info.hack;
  }
  get str(): number {
    return this.info.str;
  }
  get def(): number {
    return this.info.def;
  }
  get dex(): number {
    return this.info.dex;
  }
  get agi(): number {
    return this.info.agi;
  }
  get cha(): number {
    return this.info.cha;
  }
  get hack_exp(): number {
    return this.info.hack_exp;
  }
  get str_exp(): number {
    return this.info.str_exp;
  }
  get def_exp(): number {
    return this.info.def_exp;
  }
  get dex_exp(): number {
    return this.info.dex_exp;
  }
  get agi_exp(): number {
    return this.info.agi_exp;
  }
  get cha_exp(): number {
    return this.info.cha_exp;
  }
  get hack_mult(): number {
    return this.info.hack_mult;
  }
  get str_mult(): number {
    return this.info.str_mult;
  }
  get def_mult(): number {
    return this.info.def_mult;
  }
  get dex_mult(): number {
    return this.info.dex_mult;
  }
  get agi_mult(): number {
    return this.info.agi_mult;
  }
  get cha_mult(): number {
    return this.info.cha_mult;
  }
  get hack_asc_mult(): number {
    return this.info.hack_asc_mult;
  }
  get str_asc_mult(): number {
    return this.info.str_asc_mult;
  }
  get def_asc_mult(): number {
    return this.info.def_asc_mult;
  }
  get dex_asc_mult(): number {
    return this.info.dex_asc_mult;
  }
  get agi_asc_mult(): number {
    return this.info.agi_asc_mult;
  }
  get cha_asc_mult(): number {
    return this.info.cha_asc_mult;
  }
  get hack_asc_points(): number {
    return this.info.hack_asc_points;
  }
  get str_asc_points(): number {
    return this.info.str_asc_points;
  }
  get def_asc_points(): number {
    return this.info.def_asc_points;
  }
  get dex_asc_points(): number {
    return this.info.dex_asc_points;
  }
  get agi_asc_points(): number {
    return this.info.agi_asc_points;
  }
  get cha_asc_points(): number {
    return this.info.cha_asc_points;
  }
  get upgrades(): string[] {
    return this.info.upgrades;
  }
  get augmentations(): string[] {
    return this.info.augmentations;
  }
  get respectGain(): number {
    return this.info.respectGain;
  }
  get wantedLevelGain(): number {
    return this.info.wantedLevelGain;
  }
  get moneyGain(): number {
    return this.info.moneyGain;
  }

  public computeRepGains(currentTask: GangTaskStats): number {
    return this.ns.formulas.gang.respectGain(this.gangInfo(), this.info, currentTask);
  }

  public computeWantedGains(currentTask: GangTaskStats): number {
    return this.ns.formulas.gang.wantedLevelGain(this.gangInfo(), this.info, currentTask);
  }

  public calculateMoneyGains(currentTask: GangTaskStats): number {
    return this.ns.formulas.gang.moneyGain(this.gangInfo(), this.info, currentTask);
  }

  protected gangInfo(): GangGenInfo {
    return this.ns.gang.getGangInformation();
  }

  public getWantedPenalty(): number {
    return this.ns.formulas.gang.wantedPenalty(this.gangInfo());
  }
  public getTerritoryPenalty(): number {
    return (0.2 * this.gangInfo().territory + 0.8) * this.ns.getBitNodeMultipliers().GangSoftcap;
  }

  public tasks(): ITask[] {
    return this.ns.gang
      .getTaskNames()
      .map((name) => this.ns.gang.getTaskStats(name))
      .map((task: GangTaskStats) => {
        return {
          name: task.name,
          respect: this.computeRepGains(task),
          money: this.calculateMoneyGains(task),
          wanted: this.computeWantedGains(task),
          task: task,
        };
        // Completely remove tasks that offer no gains, but would generate wanted levels
      })
      .filter((task) => task.wanted <= 0 || task.money > 0 || task.respect > 0);
  }

  protected expectedAscensionResult(): GangMemberAscension {
    return (
      this.mafia.gang.getAscensionResult(this.name) ?? {
        /** Amount of respect lost from ascending */
        respect: 0,
        /** Hacking multiplier gained from ascending.*/
        hack: 0,
        /** Strength multiplier gained from ascending.*/
        str: 0,
        /** Defense multiplier gained from ascending.*/
        def: 0,
        /** Dexterity multiplier gained from ascending.*/
        dex: 0,
        /** Agility multiplier gained from ascending.*/
        agi: 0,
        /** Charisma multiplier gained from ascending.*/
        cha: 0,
      }
    );
  }

  public ascend() {
    let ascMultiThreshold = this.ascensionThreshold;
    let importantStats = ['str', 'def', 'dex', 'agi'];
    let expectedResults = this.expectedAscensionResult();

    if (importantStats.some((stat) => expectedResults[stat] >= ascMultiThreshold)) {
      if (this.ns.gang.ascendMember(this.name) !== undefined) {
        this.ns.print(
          `${new Date().toISOString()} Ascended member ${this.name} to increase multis by ${importantStats
            .map((s) => `${s} -> ${expectedResults[s].toFixed(2)}x`)
            .join(', ')}`
        );
      }
    }
  }
}

interface ITask {
  name: string;
  respect: number;
  money: number;
  wanted: number;
  task: GangTaskStats;
}
