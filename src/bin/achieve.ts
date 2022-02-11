import { NS } from "Bitburner";

function getProps(obj: Element) {
  let entries: [string, any][] = Object.entries(obj);
  if (entries == undefined) {
    return;
  }
  let results = entries.find((entry) => entry[0].startsWith("__reactProps"));
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
  let boxes: Element[] = Array.from(
    document.querySelectorAll("[class*=MuiBox-root]")
  );
  let box: Element | undefined = boxes.find((x: Element ) => hasPlayer(x));

  if (box === undefined) {
    return;
  }

  let props = getProps(box);
  //  open dev menu
  props.router.toDevMenu();
}
