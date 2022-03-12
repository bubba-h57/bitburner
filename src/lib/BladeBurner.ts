import { Skill } from '/lib/Skill';
import { NS, BladeburnerCurAction } from 'Bitburner';
import { BladeBurnerSkills } from '/lib/BladeBurnerSkills';

export class BladeBurner {
  public ns: NS;

  resting: boolean;
  contracts: string[];
  operations: string[];

  restAction: BladeburnerCurAction = {
    type: 'General',
    name: 'Hyperbolic Regeneration Chamber',
  };

  targetAction: BladeburnerCurAction = {
    type: '',
    name: '',
  };

  constructor(ns: NS) {
    this.ns = ns;
    this.resting = false;
    this.contracts = this.ns.bladeburner.getContractNames();
    this.operations = this.ns.bladeburner.getOperationNames();
  }

  public getChance(type: string, name: string): [number, number] {
    return this.ns.bladeburner.getActionEstimatedSuccessChance(type, name);
  }

  public rest(): number {
    this.act(this.restAction);
    this.resting = true;
    return this.ns.bladeburner.getActionTime(this.restAction.type, this.restAction.name);
  }

  public act(targetAction: BladeburnerCurAction) {
    let curAction: BladeburnerCurAction = this.ns.bladeburner.getCurrentAction();
    if (curAction.type != targetAction.type || curAction.name != targetAction.name) {
      this.ns.print(`ERROR Ending Action: ${curAction.type} : ${curAction.name}`);
      if (this.ns.bladeburner.startAction(targetAction.type, targetAction.name)) {
        this.ns.print(`INFO Starting Action: ${targetAction.type} : ${targetAction.name}`);
      }
    }
  }

  public getActionCountRemaining(type: string, name: string) {
    return this.ns.bladeburner.getActionCountRemaining(type, name);
  }

  public work() {
    const bestContract = this.contracts
      .map(function (contract) {
        let chance = 0;

        if (this.getActionCountRemaining('Contract', contract) > 50) {
          chance = this.getChance('Contract', contract);
        }

        return {
          type: 'Contract',
          name: contract,
          chance: chance,
        };
      }, this)
      .reduce((a, b) => (a.chance > b.chance ? a : b));

    this.targetAction.name = bestContract.name;
    this.targetAction.type = bestContract.type;

    const bestOp = this.operations
      .map(function (operation) {
        let chance = 0;
        if (this.getActionCountRemaining('Operation', operation) > 50) {
          chance = this.getChance('Operation', operation);
        }
        return {
          type: 'Operation',
          name: operation,
          chance: chance,
        };
      }, this)
      .reduce((a, b) => (a.chance > b.chance ? a : b));

    if (bestOp.chance >= bestContract.chance) {
      this.targetAction.name = bestOp.name;
      this.targetAction.type = bestOp.type;
    }

    this.act(this.targetAction);

    return this.ns.bladeburner.getActionTime(this.targetAction.type, this.targetAction.name);
  }

  public getStaminaPercentage() {
    const res = this.ns.bladeburner.getStamina();
    return res[0] / res[1];
  }

  public isTired(percentage: number = 0.33): boolean {
    return this.getStaminaPercentage() < percentage;
  }

  public unHealthy(percentage: number = 0.33): boolean {
    return this.ns.getPlayer().hp < this.ns.getPlayer().max_hp * percentage;
  }

  public healthy(percentage: number = 0.99): boolean {
    return this.ns.getPlayer().hp >= this.ns.getPlayer().max_hp * percentage;
  }

  public canWork() {
    if (this.isTired()) {
      this.resting = true;
      return false;
    }

    if (this.unHealthy()) {
      this.resting = true;
      return false;
    }

    if (this.resting) {
      if (this.healthy()) {
        this.resting = false;
        return true;
      }
      return false;
    }
    return true;
  }

  public upgradeSkill(priority: number = 0) {
    let skills: Skill[] = BladeBurnerSkills(this.ns);
    for (let index = 0; index < skills.length; index++) {
      const skill = skills[index];
      if (index === priority) {
        if (skill.level >= skill.targetLevel) {
          priority++;
          this.ns.print(`Incrementing Skill Priority to ${skills[priority]}`);
          return priority;
        }
        while (skill.cost < this.ns.bladeburner.getSkillPoints()) {
          this.ns.print(`WARN ${skill.name} is affordable.`);
          if (this.ns.bladeburner.upgradeSkill(skill.name)) {
            this.ns.print('ERROR Upgrading Skill: ' + skill.name);
          }
        }
      }
    }
    return priority;
  }

  public takeAction() {
    this.canWork() ? this.work() : this.rest();
    return;
  }
}
