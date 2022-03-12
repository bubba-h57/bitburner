import { NS, SleeveSkills, SleeveInformation, AugmentPair, SleeveTask } from 'Bitburner';

export class Sleeve {
  protected ns: NS;
  protected port: number;

  constructor(ns: NS, port: number) {
    this.ns = ns;
    this.port = port;
  }

  protected async exec(script: string, args: (string | number | boolean)[] = []) {
    let pid = this.ns.exec(`/opt/sleeve/bin/${script}.js`, 'home', 1, this.port, ...args);
    while (this.ns.isRunning(pid, 'home')) {
      await this.ns.sleep(20);
    }
    return await this.ns.readPort(this.port);
  }

  /**
   * Get the number of sleeves you own.
   *
   * @returns number of duplicate sleeves the player has.
   */
  public async getNumSleeves(): Promise<number> {
    return parseInt(await this.exec('getNumSleeves'));
  }

  /**
   * Get the stats of a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to get stats of.
   * @returns Object containing the stats of the sleeve.
   */
  public async getSleeveStats(sleeveNumber: number): Promise<SleeveSkills> {
    return JSON.parse(await this.exec('getSleeveStats', [sleeveNumber]));
  }

  /**
   * Get information about a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve information.
   * @returns Object containing tons of information about this sleeve.
   */
  public async getInformation(sleeveNumber: number): Promise<SleeveInformation> {
    return JSON.parse(await this.exec('getInformation', [sleeveNumber]));
  }

  /**
   * Get task of a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve task from.
   * @returns Object containing information the current task that the sleeve is performing.
   */
  public async getTask(sleeveNumber: number): Promise<SleeveTask> {
    return this.ns.sleeve.getTask(sleeveNumber);
  }

  /**
   * Set a sleeve to shock recovery.
   *
   * @param sleeveNumber - Index of the sleeve to start recovery.
   * @returns True if this action was set successfully, false otherwise.
   */
  public async setToShockRecovery(sleeveNumber: number): Promise<boolean> {
    return this.ns.sleeve.setToShockRecovery(sleeveNumber);
  }

  /**
   * Set a sleeve to synchronize.
   *
   * @param sleeveNumber - Index of the sleeve to start synchronizing.
   * @returns True if this action was set successfully, false otherwise.
   */
  public async setToSynchronize(sleeveNumber: number): Promise<boolean> {
    return this.ns.sleeve.setToSynchronize(sleeveNumber);
  }

  /**
   * Set a sleeve to commit crime.
   * Return a boolean indicating whether or not this action was set successfully.
   *
   * Returns false if an invalid action is specified.
   *
   * @param sleeveNumber - Index of the sleeve to start commiting crime.
   * @param name - Name of the crime. Must be an exact match.
   * @returns True if this action was set successfully, false otherwise.
   */
  public async setToCommitCrime(sleeveNumber: number, name: string): Promise<boolean> {
    return this.ns.sleeve.setToCommitCrime(sleeveNumber, name);
  }

  /**
   * Set a sleeve to work for a faction.
   *
   * Return a boolean indicating whether or not the sleeve started working or this faction.
   *
   * @param sleeveNumber - Index of the sleeve to work for the faction.
   * @param factionName - Name of the faction to work for.
   * @param factionWorkType - Name of the action to perform for this faction.
   * @returns True if the sleeve started working on this faction, false otherwise.
   */
  public async setToFactionWork(sleeveNumber: number, factionName: string, factionWorkType: string): Promise<boolean> {
    return this.ns.sleeve.setToFactionWork(sleeveNumber, factionName, factionWorkType);
  }

  /**
   * Set a sleeve to work for a company.
   *
   * Return a boolean indicating whether or not the sleeve started working or this company.
   *
   * @param sleeveNumber - Index of the sleeve to work for the company.
   * @param companyName - Name of the company to work for.
   * @returns True if the sleeve started working on this company, false otherwise.
   */
  public async setToCompanyWork(sleeveNumber: number, companyName: string): Promise<boolean> {
    return this.ns.sleeve.setToCompanyWork(sleeveNumber, companyName);
  }

  /**
   * Set a sleeve to take a class at a university.
   *
   * Return a boolean indicating whether or not this action was set successfully.
   *
   * @param sleeveNumber - Index of the sleeve to start taking class.
   * @param university - Name of the university to attend.
   * @param className - Name of the class to follow.
   * @returns True if this action was set successfully, false otherwise.
   */
  public async setToUniversityCourse(sleeveNumber: number, university: string, className: string): Promise<boolean> {
    return this.ns.sleeve.setToUniversityCourse(sleeveNumber, university, className);
  }

  /**
   * Set a sleeve to workout at the gym.
   *
   * Return a boolean indicating whether or not the sleeve started working out.
   *
   * @param sleeveNumber - Index of the sleeve to workout at the gym.
   * @param gymName - Name of the gym.
   * @param stat - Name of the stat to train.
   * @returns True if the sleeve started working out, false otherwise.
   */
  public async setToGymWorkout(sleeveNumber: number, gymName: string, stat: string): Promise<boolean> {
    return this.ns.sleeve.setToGymWorkout(sleeveNumber, gymName, stat);
  }

  /**
   * Make a sleeve travel to another city.
   *
   * Return a boolean indicating whether or not the sleeve reached destination.
   *
   * @param sleeveNumber - Index of the sleeve to travel.
   * @param cityName - Name of the destination city.
   * @returns True if the sleeve reached destination, false otherwise.
   */
  public async travel(sleeveNumber: number, cityName: string): Promise<boolean> {
    return this.ns.sleeve.travel(sleeveNumber, cityName);
  }

  /**
   * Get augmentations installed on a sleeve.
   *
   * Return a list of augmentation names that this sleeve has installed.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve augmentations from.
   * @returns List of augmentation names that this sleeve has installed.
   */
  public async getSleeveAugmentations(sleeveNumber: number): Promise<string[]> {
    return this.ns.sleeve.getSleeveAugmentations(sleeveNumber);
  }

  /**
   * List purchasable augs for a sleeve.
   *
   * Return a list of augmentations that the player can buy for this sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve purchasable augmentations from.
   * @returns List of augmentations that the player can buy for this sleeve.
   */
  public async getSleevePurchasableAugs(sleeveNumber: number): Promise<AugmentPair[]> {
    return this.ns.sleeve.getSleevePurchasableAugs(sleeveNumber);
  }

  /**
   * Purchase an aug for a sleeve.
   *
   * Return true if the aug was purchased and installed on the sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to buy an aug for.
   * @param augName - Name of the aug to buy. Must be an exact match.
   * @returns True if the aug was purchased and installed on the sleeve, false otherwise.
   */
  public async purchaseSleeveAug(sleeveNumber: number, augName: string): Promise<boolean> {
    return this.ns.sleeve.purchaseSleeveAug(sleeveNumber, augName);
  }
}
