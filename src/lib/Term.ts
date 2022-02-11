import { NS } from "Bitburner";

/**
 * Writes an ephemeral message to the terminal.
 *
 * @param {string} message
 */
export function writeOutFixedLength(message: string) {
  message.replace(/ /g, function (i: any) {
    return "&nbsp;";
  });
  out(message);
}

export function out(message: string) {
  let output = [
    '<li class="jss663 MuiListItem-root MuiListItem-gutters MuiListItem-padding css-1rxnx5a" style="padding: 0px">',
    '<p class="jss668 MuiTypography-root MuiTypography-body1 css-eezd29">',
    message,
    "</p>",
    "</li>",
  ].join("");

  const list = document.getElementById("terminal");
  list?.insertAdjacentHTML("beforeend", output);
}

/**
 * Determines if a flag exists in the script arguments.
 *
 * @param {NS} ns
 * @param {string} flag
 * @returns
 */
export function hasFlag(ns: NS, flag: string) {
  let flagIndex = ns.args.findIndex((value: any) => value === flag);
  return flagIndex !== -1;
}
