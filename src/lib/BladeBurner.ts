import { Skill } from '/lib/Skill';
import { BladeburnerCurAction } from 'Bitburner';
import { BladeBurnerSkills } from '/lib/BladeBurnerSkills';
import { exec } from './Helpers';

export class BladeBurner {
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

  constructor() {
    this.resting = false;
    this.contracts = globalThis.ns.bladeburner.getContractNames();
    this.operations = globalThis.ns.bladeburner.getOperationNames();
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
    let skills: Skill[] = BladeBurnerSkills(globalThis.ns);
    for (let index = 0; index < skills.length; index++) {
      const skill = skills[index];
      if (index === priority) {
        if (skill.level >= skill.targetLevel) {
          priority++;
          globalThis.ns.print(`Incrementing Skill Priority to ${skills[priority]}`);
          return priority;
        }
        while (skill.cost < globalThis.ns.bladeburner.getSkillPoints()) {
          globalThis.ns.print(`WARN ${skill.name} is affordable.`);
          if (globalThis.ns.bladeburner.upgradeSkill(skill.name)) {
            globalThis.ns.print('ERROR Upgrading Skill: ' + skill.name);
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

  public rest(): number {
    this.act(this.restAction);
    this.resting = true;
    return globalThis.ns.bladeburner.getActionTime(this.restAction.type, this.restAction.name);
  }

  public act(targetAction: BladeburnerCurAction) {
    let curAction: BladeburnerCurAction = globalThis.ns.bladeburner.getCurrentAction();
    if (curAction.type != targetAction.type || curAction.name != targetAction.name) {
      globalThis.ns.print(`ERROR Ending Action: ${curAction.type} : ${curAction.name}`);
      if (globalThis.ns.bladeburner.startAction(targetAction.type, targetAction.name)) {
        globalThis.ns.print(`INFO Starting Action: ${targetAction.type} : ${targetAction.name}`);
      }
    }
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

    return globalThis.ns.bladeburner.getActionTime(this.targetAction.type, this.targetAction.name);
  }

  public getStaminaPercentage() {
    const res = globalThis.ns.bladeburner.getStamina();
    return res[0] / res[1];
  }
  public isTired(percentage: number = 0.33): boolean {
    return this.getStaminaPercentage() < percentage;
  }

  public unHealthy(percentage: number = 0.33): boolean {
    return globalThis.ns.getPlayer().hp < globalThis.ns.getPlayer().max_hp * percentage;
  }

  public healthy(percentage: number = 0.99): boolean {
    return globalThis.ns.getPlayer().hp >= globalThis.ns.getPlayer().max_hp * percentage;
  }

  // =============================================== API ==================================================
  /**
   * List all contracts.
   * @remarks
   * RAM cost: 0.4 GB
   *
   * Returns an array of strings containing the names of all Bladeburner contracts.
   *
   * @returns Array of strings containing the names of all Bladeburner contracts.
   */
  public static async contractNames(): Promise<string[]> {
    return await exec('/opt/bladeburner/bin/getContractNames');
  }

  /**
   * List all operations.
   * @remarks
   * RAM cost: 0.4 GB
   *
   * Returns an array of strings containing the names of all Bladeburner operations.
   *
   * @returns Array of strings containing the names of all Bladeburner operations.
   */
  public static async operationNames(): Promise<string[]> {
    return await exec('/opt/bladeburner/bin/getOperationNames');
  }

  /**
   * List all black ops.
   * @remarks
   * RAM cost: 0.4 GB
   *
   * Returns an array of strings containing the names of all Bladeburner Black Ops.
   *
   * @returns Array of strings containing the names of all Bladeburner Black Ops.
   */
  public static async blackOpNames(): Promise<string[]> {
    return await exec('/opt/bladeburner/bin/getBlackOpNames');
  }

  /**
   * List all general actions.
   * @remarks
   * RAM cost: 0.4 GB
   *
   * Returns an array of strings containing the names of all general Bladeburner actions.
   *
   * @returns Array of strings containing the names of all general Bladeburner actions.
   */
  public static async generalNames(): Promise<string[]> {
    return await exec('/opt/bladeburner/bin/getGeneralActionNames');
  }

  /**
   * List all skills.
   * @remarks
   * RAM cost: 0.4 GB
   *
   * Returns an array of strings containing the names of all general Bladeburner skills.
   *
   * @returns Array of strings containing the names of all general Bladeburner skills.
   */
  public static async skillNames(): Promise<string[]> {
    return await exec('/opt/bladeburner/bin/getSkillNames');
  }

  /**
   * Start an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Attempts to start the specified Bladeburner action.
   * Returns true if the action was started successfully, and false otherwise.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match
   * @returns True if the action was started successfully, and false otherwise.
   */
  public static async start(type: string, name: string): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/startAction', [type, name]);
  }

  /**
   * Stop current action.
   * @remarks
   * RAM cost: 2 GB
   *
   * Stops the current Bladeburner action.
   *
   */
  public static async stop(): Promise<void> {
    return await exec('/opt/bladeburner/bin/stopBladeburnerAction');
  }

  /**
   * Get current action.
   * @remarks
   * RAM cost: 1 GB
   *
   * Returns an object that represents the player’s current Bladeburner action.
   * If the player is not performing an action, the function will return an object with the ‘type’ property set to “Idle”.
   *
   * @returns Object that represents the player’s current Bladeburner action.
   */
  public static async currentAction(): Promise<BladeburnerCurAction> {
    return await exec('/opt/bladeburner/bin/getCurrentAction');
  }

  /**
   * Get the time to complete an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the number of seconds it takes to complete the specified action
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Number of milliseconds it takes to complete the specified action.
   */
  public static async actionTime(type: string, name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getActionTime', [type, name]);
  }

  /**
   * Get estimate success chance of an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the estimated success chance for the specified action.
   * This chance is returned as a decimal value, NOT a percentage
   * (e.g. if you have an estimated success chance of 80%, then this function will return 0.80, NOT 80).
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Estimated success chance for the specified action.
   */
  public static async chance(type: string, name: string): Promise<[number, number]> {
    return await exec('/opt/bladeburner/bin/getActionEstimatedSuccessChance', [type, name]);
  }

  /**
   * Get the reputation gain of an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the average Bladeburner reputation gain for successfully
   * completing the specified action.
   * Note that this value is an ‘average’ and the real reputation gain may vary slightly from this value.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @param level - Optional action level at which to calculate the gain
   * @returns Average Bladeburner reputation gain for successfully completing the specified action.
   */
  public static async repGain(type: string, name: string, level: number): Promise<number> {
    return await exec('/opt/bladeburner/bin/getActionRepGain', [type, name, level]);
  }

  /**
   * Get action count remaining.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the remaining count of the specified action.
   *
   * Note that this is meant to be used for Contracts and Operations.
   * This function will return ‘Infinity’ for actions such as Training and Field Analysis.
   * This function will return 1 for BlackOps not yet completed regardless of wether
   * the player has the required rank to attempt the mission or not.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Remaining count of the specified action.
   */
  public static async remaining(type: string, name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getActionCountRemaining', [type, name]);
  }

  /**
   * Get the maximum level of an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the maximum level for this action.
   *
   * Returns -1 if an invalid action is specified.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Maximum level of the specified action.
   */
  public static async maxLevel(type: string, name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getActionMaxLevel', [type, name]);
  }

  /**
   * Get the current level of an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the current level of this action.
   *
   * Returns -1 if an invalid action is specified.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Current level of the specified action.
   */
  public static async currentLevel(type: string, name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getActionCurrentLevel', [type, name]);
  }

  /**
   * Get wether an action is set to autolevel.
   * @remarks
   * RAM cost: 4 GB
   *
   * Return a boolean indicating whether or not this action is currently set to autolevel.
   *
   * Returns false if an invalid action is specified.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns True if the action is set to autolevel, and false otherwise.
   */
  public static async autolevel(type: string, name: string): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/getActionAutolevel', [type, name]);
  }

  /**
   * Set an action autolevel.
   * @remarks
   * RAM cost: 4 GB
   *
   * Enable/disable autoleveling for the specified action.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @param autoLevel - Whether or not to autolevel this action
   */
  public static async setAutolevel(type: string, name: string, autoLevel: boolean): Promise<void> {
    return await exec('/opt/bladeburner/bin/setActionAutolevel', [type, name, autoLevel]);
  }

  /**
   * Set the level of an action.
   * @remarks
   * RAM cost: 4 GB
   *
   * Set the level for the specified action.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @param level - Level to set this action to.
   */
  public static async setLevel(type: string, name: string, level: number): Promise<void> {
    return await exec('/opt/bladeburner/bin/setActionLevel', [type, name, level]);
  }

  /**
   * Get player bladeburner rank.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the player’s Bladeburner Rank.
   *
   * @returns Player’s Bladeburner Rank.
   */
  public static async rank(): Promise<number> {
    return await exec('/opt/bladeburner/bin/getRank');
  }

  /**
   * Get black op required rank.
   * @remarks
   * RAM cost: 2 GB
   *
   * Returns the rank required to complete this BlackOp.
   *
   * Returns -1 if an invalid action is specified.
   *
   * @param name - Name of BlackOp. Must be an exact match.
   * @returns Rank required to complete this BlackOp.
   */
  public static async blackOpRank(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getBlackOpRank', [name]);
  }

  /**
   * Get bladeburner skill points.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the number of Bladeburner skill points you have.
   *
   * @returns Number of Bladeburner skill points you have.
   */
  public static async skillPoints(): Promise<number> {
    return await exec('/opt/bladeburner/bin/getSkillPoints');
  }

  /**
   * Get skill level.
   * @remarks
   * RAM cost: 4 GB
   *
   * This function returns your level in the specified skill.
   *
   * The function returns -1 if an invalid skill name is passed in.
   *
   * @param skillName - Name of skill. Case-sensitive and must be an exact match
   * @returns Level in the specified skill.
   */
  public static async level(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getSkillLevel', [name]);
  }

  /**
   * Get cost to upgrade skill.
   * @remarks
   * RAM cost: 4 GB
   *
   * This function returns the number of skill points needed to upgrade the specified skill.
   *
   * The function returns -1 if an invalid skill name is passed in.
   *
   * @param skillName - Name of skill. Case-sensitive and must be an exact match
   * @returns Number of skill points needed to upgrade the specified skill.
   */
  public static async upgradeCost(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getSkillUpgradeCost', [name]);
  }

  /**
   * Upgrade skill.
   * @remarks
   * RAM cost: 4 GB
   *
   * Attempts to upgrade the specified Bladeburner skill.
   *
   * Returns true if the skill is successfully upgraded, and false otherwise.
   *
   * @param name - Name of skill to be upgraded. Case-sensitive and must be an exact match
   * @returns true if the skill is successfully upgraded, and false otherwise.
   */
  public static async upgrade(name: string): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/upgradeSkill', [name]);
  }

  /**
   * Get team size.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the number of Bladeburner team members you have assigned to the specified action.
   *
   * Setting a team is only applicable for Operations and BlackOps. This function will return 0 for other action types.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @returns Number of Bladeburner team members that were assigned to the specified action.
   */
  public static async size(type: string, name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getTeamSize', [type, name]);
  }

  /**
   * Set team size.
   * @remarks
   * RAM cost: 4 GB
   *
   * Set the team size for the specified Bladeburner action.
   *
   * Returns the team size that was set, or -1 if the function failed.
   *
   * @param type - Type of action.
   * @param name - Name of action. Must be an exact match.
   * @param size - Number of team members to set. Will be converted using Math.round().
   * @returns Number of Bladeburner team members you assigned to the specified action.
   */
  public static async setSize(type: string, name: string, size: number): Promise<number> {
    return await exec('/opt/bladeburner/bin/setTeamSize', [type, name, size]);
  }

  /**
   * Get estimated population in city.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the estimated number of Synthoids in the specified city,
   * or -1 if an invalid city was specified.
   *
   * @param name - Name of city. Case-sensitive
   * @returns Estimated number of Synthoids in the specified city.
   */
  public static async estimatedPopulation(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getCityEstimatedPopulation', [name]);
  }

  /**
   * Get number of communities in a city.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the estimated number of Synthoid communities in the specified city,
   * or -1 if an invalid city was specified.
   *
   * @param name - Name of city. Case-sensitive
   * @returns Number of Synthoids communities in the specified city.
   */
  public static async communities(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getCityCommunities', [name]);
  }

  /**
   * Get chaos of a city.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the chaos in the specified city,
   * or -1 if an invalid city was specified.
   *
   * @param cityName - Name of city. Case-sensitive
   * @returns Chaos in the specified city.
   */
  public static async chaos(name: string): Promise<number> {
    return await exec('/opt/bladeburner/bin/getCityChaos', [name]);
  }

  /**
   * Get current city.
   * @remarks
   * RAM cost: 4 GB
   *
   * Returns the city that the player is currently in (for Bladeburner).
   *
   * @returns City that the player is currently in (for Bladeburner).
   */
  public static async city(): Promise<string> {
    return await exec('/opt/bladeburner/bin/getCity');
  }

  /**
   * Travel to another city in bladeburner.
   * @remarks
   * RAM cost: 4 GB
   * Attempts to switch to the specified city (for Bladeburner only).
   *
   * Returns true if successful, and false otherwise
   *
   * @param name - Name of city. Case-sensitive
   * @returns true if successful, and false otherwise
   */
  public static async moveToCity(name: string): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/switchCity', [name]);
  }

  /**
   * Get bladeburner stamina.
   * @remarks
   * RAM cost: 4 GB
   * Returns an array with two elements:
   * * [Current stamina, Max stamina]
   * @example
   * ```ts
   * // NS1:
   * function getStaminaPercentage() {
   *    var res = bladeburner.getStamina();
   *    return res[0] / res[1];
   * }
   * ```
   * @example
   * ```ts
   * // NS2:
   * function getStaminaPercentage() {
   *    const [current, max] = ns.bladeburner.getStamina();
   *    return current / max;
   * }
   * ```
   * @returns Array containing current stamina and max stamina.
   */
  public static async stamina(): Promise<[number, number]> {
    return await exec('/opt/bladeburner/bin/getStamina');
  }

  /**
   * Join the bladeburner faction.
   * @remarks
   * RAM cost: 4 GB
   * Attempts to join the Bladeburner faction.
   *
   * Returns true if you successfully join the Bladeburner faction, or if you are already a member.
   *
   * Returns false otherwise.
   *
   * @returns True if you successfully join the Bladeburner faction, or if you are already a member, false otherwise.
   */
  public static async joinFaction(): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/joinBladeburnerFaction');
  }

  /**
   * Join the bladeburner division.
   * @remarks
   * RAM cost: 4 GB
   *
   * Attempts to join the Bladeburner division.
   *
   * Returns true if you successfully join the Bladeburner division, or if you are already a member.
   *
   * Returns false otherwise.
   *
   * @returns True if you successfully join the Bladeburner division, or if you are already a member, false otherwise.
   */
  public static async joinDivision(): Promise<boolean> {
    return await exec('/opt/bladeburner/bin/joinBladeburnerDivision');
  }

  /**
   * Get bladeburner bonus time.
   * @remarks
   * RAM cost: 0 GB
   *
   * Returns the amount of accumulated “bonus time” (seconds) for the Bladeburner mechanic.
   *
   * “Bonus time” is accumulated when the game is offline or if the game is inactive in the browser.
   *
   * “Bonus time” makes the game progress faster, up to 5x the normal speed.
   * For example, if an action takes 30 seconds to complete but you’ve accumulated over
   * 30 seconds in bonus time, then the action will only take 6 seconds in real life to complete.
   *
   * @returns Amount of accumulated “bonus time” (milliseconds) for the Bladeburner mechanic.
   */
  public static async bonusTime(): Promise<number> {
    return await exec('/opt/bladeburner/bin/getBonusTime');
  }
}
