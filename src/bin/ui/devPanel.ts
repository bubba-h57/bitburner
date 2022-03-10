import { NS } from 'Bitburner';
import { Locations } from '/lib/Locations';

function getProps(obj: Element) {
  let entries: [string, any][] = Object.entries(obj);
  if (entries == undefined) {
    return;
  }
  let results = entries.find((entry) => entry[0].startsWith('__reactProps'));

  if (results == undefined) {
    return;
  }
  return results[1].children.props;
}

let hasPlayer = (obj: Element) => {
  try {
    return getProps(obj).player ? true : false;
  } catch (ex) {
    return false;
  }
};
/** @param {NS} ns **/
export async function main(ns: NS) {
  //document.achievements.push("UNACHIEVABLE");
  let boxes: Element[] = Array.from(document.querySelectorAll('[class*=MuiBox-root]'));
  let box: Element | undefined = boxes.find((x: Element) => hasPlayer(x));

  if (box === undefined) {
    return;
  }

  getProps(box).router.toDevMenu();
  //console.log('Props object: %o', Locations);
  //  open dev menu
  // props.router.toInfiltration(Locations['Bachman & Associates']);

  /**
   *
   *
   * toAchievements
   * toActiveScripts
   * toAutmentations
   * toBitVerse
   * toBladeburner
   * toBladeburnerCinematic
   * toCity
   * toCorporation
   * toCreateProgram
   * toDevMenu
   * toFaction
   * tofactions
   * toGameOptions
   * toGang
   * toHacknetNodes
   * toInfiltration
   * toJob
   * toLocation
   * toMilestones
   * toResleeves
   * toScriptEditor
   * toSleeves
   * toStaneksGift
   * toStats
   * toStockMarket
   * toTerminal
   * toTravel
   * toTutorial
   * toWork
   */
}
