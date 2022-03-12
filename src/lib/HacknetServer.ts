import { HacknetMultipliers, NodeStats, NS } from 'Bitburner';

export class HacknetServer {
  public ns: NS;
  public id: number;
  public nodeStats: NodeStats;
  public costMulitpliers: HacknetMultipliers;

  constructor(ns: NS, nodeStats: NodeStats, id: number) {
    this.id = id;
    this.ns = ns;
    this.nodeStats = nodeStats;
    this.costMulitpliers = ns.getHacknetMultipliers();
  }

  public hashGainRate(level: number, ramUsed: number, maxRam: number, cores: number): number {
    return this.ns.formulas.hacknetServers.hashGainRate(level, ramUsed, maxRam, cores);
  }

  public levelUpgradeHashGainRate(): number {
    return this.ns.formulas.hacknetServers.hashGainRate(
      this.nodeStats.level + 1,
      this.nodeStats.ramUsed,
      this.nodeStats.ram,
      this.nodeStats.cores
    );
  }
  public ramUpgradeHashGainRate(): number {
    return this.ns.formulas.hacknetServers.hashGainRate(
      this.nodeStats.level,
      this.nodeStats.ramUsed,
      this.nodeStats.ram + 1,
      this.nodeStats.cores
    );
  }
  public coreUpgradeHashGainRate(): number {
    return this.ns.formulas.hacknetServers.hashGainRate(
      this.nodeStats.level,
      this.nodeStats.ramUsed,
      this.nodeStats.ram,
      this.nodeStats.cores + 1
    );
  }
  public levelUpgradeCost(): number {
    return this.ns.formulas.hacknetServers.levelUpgradeCost(this.nodeStats.level, 1, this.costMulitpliers.levelCost);
  }
  public ramUpgradeCost(): number {
    return this.ns.formulas.hacknetServers.ramUpgradeCost(this.nodeStats.ram, 1, this.costMulitpliers.ramCost);
  }
  public coreUpgradeCost(): number {
    return this.ns.formulas.hacknetServers.coreUpgradeCost(this.nodeStats.cores, 1, this.costMulitpliers.coreCost);
  }

  public upgradeForHashGain(): boolean {
    let upgrades = [
      {
        type: 'level',
        gain: this.levelUpgradeHashGainRate(),
        upgrade: this.ns.hacknet.upgradeLevel,
        cost: this.levelUpgradeHashGainRate(),
      },
      {
        type: 'ram',
        gain: this.ramUpgradeHashGainRate(),
        upgrade: this.ns.hacknet.upgradeRam,
        cost: this.ramUpgradeHashGainRate(),
      },
      {
        type: 'core',
        gain: this.coreUpgradeHashGainRate(),
        upgrade: this.ns.hacknet.upgradeCore,
        cost: this.coreUpgradeHashGainRate(),
      },
    ].sort((a, b) => a.gain - b.gain);

    let result = upgrades[2].upgrade(this.id, 1);
    if (result) {
      this.ns.print(`Upgraded Node ${this.id} ${upgrades[2].type}`);
    }
    return result;
  }
}
