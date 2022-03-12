import { SleeveSkills, SleeveInformation, AugmentPair, SleeveTask } from 'Bitburner';
import { exec } from '/lib/Helpers';

export class Clone {
  /**
   * Get the number of sleeves you own.
   *
   * @returns number of duplicate sleeves the player has.
   */
  static async numSleeves(): Promise<number> {
    return parseInt(await exec('/opt/sleeve/bin/getNumSleeves'));
  }

  /**
   * Get the stats of a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to get stats of.
   * @returns Object containing the stats of the sleeve.
   */
  static async stats(sleeveNumber: number): Promise<SleeveSkills> {
    return await exec('/opt/sleeve/bin/getSleeveStats', [sleeveNumber]);
  }

  /**
   * Get information about a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve information.
   * @returns Object containing tons of information about this sleeve.
   */
  static async information(sleeveNumber: number): Promise<SleeveInformation> {
    return await exec('/opt/sleeve/bin/getInformation', [sleeveNumber]);
  }

  /**
   * Get task of a sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve task from.
   * @returns Object containing information the current task that the sleeve is performing.
   */
  static async task(sleeveNumber: number): Promise<SleeveTask> {
    return await exec('/opt/sleeve/bin/getTask', [sleeveNumber]);
  }

  /**
   * Set a sleeve to shock recovery.
   *
   * @param sleeveNumber - Index of the sleeve to start recovery.
   * @returns True if this action was set successfully, false otherwise.
   */
  static async shockRecovery(sleeveNumber: number): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToShockRecovery', [sleeveNumber]);
  }

  /**
   * Set a sleeve to synchronize.
   *
   * @param sleeveNumber - Index of the sleeve to start synchronizing.
   * @returns True if this action was set successfully, false otherwise.
   */
  static async synchronize(sleeveNumber: number): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToSynchronize', [sleeveNumber]);
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
  static async commitCrime(sleeveNumber: number, name: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToCommitCrime', [sleeveNumber, name]);
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
  static async factionWork(sleeveNumber: number, factionName: string, factionWorkType: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToGymWorkout', [sleeveNumber, factionName, factionWorkType]);
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
  static async companyWork(sleeveNumber: number, companyName: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToGymWorkout', [sleeveNumber, companyName]);
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
  static async universityCourse(sleeveNumber: number, university: string, className: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToGymWorkout', [sleeveNumber, university, className]);
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
  static async gymWorkout(sleeveNumber: number, gymName: string, stat: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/setToGymWorkout', [sleeveNumber, gymName, stat]);
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
  static async travel(sleeveNumber: number, cityName: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/travel', [sleeveNumber, cityName]);
  }

  /**
   * Get augmentations installed on a sleeve.
   *
   * Return a list of augmentation names that this sleeve has installed.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve augmentations from.
   * @returns List of augmentation names that this sleeve has installed.
   */
  static async augmentations(sleeveNumber: number): Promise<string[]> {
    return await exec('/opt/sleeve/bin/getSleeveAugmentations', [sleeveNumber]);
  }

  /**
   * List purchasable augs for a sleeve.
   *
   * Return a list of augmentations that the player can buy for this sleeve.
   *
   * @param sleeveNumber - Index of the sleeve to retrieve purchasable augmentations from.
   * @returns List of augmentations that the player can buy for this sleeve.
   */
  static async purchasableAugs(sleeveNumber: number): Promise<AugmentPair[]> {
    return await exec('/opt/sleeve/bin/getSleevePurchasableAugs', [sleeveNumber]);
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
  static async purchaseAug(sleeveNumber: number, augName: string): Promise<boolean> {
    return await exec('/opt/sleeve/bin/purchaseSleeveAug', [sleeveNumber, augName]);
  }
}
