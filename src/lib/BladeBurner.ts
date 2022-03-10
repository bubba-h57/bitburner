import { NS, BladeburnerCurAction } from 'Bitburner';

export class BladeBurner {
  ns: NS;

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
      this.ns.print(`  Ending Action: ${curAction.type} : ${curAction.name}`);
      if (this.ns.bladeburner.startAction(targetAction.type, targetAction.name)) {
        this.ns.print(`Starting Action: ${targetAction.type} : ${targetAction.name}`);
      }
    }
  }

  public work() {
    const bestContract = this.contracts
      .map((contract) => {
        return {
          type: 'Contract',
          name: contract,
          chance: this.getChance('Contract', contract),
        };
      })
      .reduce((a, b) => (a.chance > b.chance ? a : b));

    this.targetAction.name = bestContract.name;
    this.targetAction.type = bestContract.type;

    const bestOp = this.operations
      .map((operation) => {
        return {
          type: 'Operation',
          name: operation,
          chance: this.getChance('Operation', operation),
        };
      })
      .reduce((a, b) => (a.chance > b.chance ? a : b));

    if (bestOp.chance >= bestContract.chance) {
      this.ns.print('Chance: ' + bestContract);
      this.targetAction.name = bestOp.name;
      this.targetAction.type = bestOp.type;
    }

    this.act(this.targetAction);

    return this.ns.bladeburner.getActionTime(this.targetAction.type, this.targetAction.name);
  }

  public getStaminaPercentage() {
    const res = this.ns.bladeburner.getStamina();
    return 100 * (res[0] / res[1]);
  }

  public canWork() {
    if (this.resting) {
      if (this.getStaminaPercentage() > 95) {
        this.resting = false;
        return true;
      }
      return false;
    }

    if (this.getStaminaPercentage() < 33 || this.ns.getPlayer().hp < this.ns.getPlayer().max_hp * 0.5) {
      return false;
    }
    return true;
  }
}
