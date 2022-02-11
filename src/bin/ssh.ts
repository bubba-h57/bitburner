import { NS } from "Bitburner";
import { findPath } from "/lib/Servers.js";


export async function main(ns: NS) {
  let path = await findPath(ns, ns.args[0].toString());
  let output = "home;";

  path.forEach((hostname) => (output += " connect " + hostname + ";"));

  const terminalInput = (<HTMLInputElement>document.getElementById("terminal-input"));
  if (terminalInput === null) {
    return;
  }
  terminalInput.value = output;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}

export function autocomplete(data, args) {
  return [...data.servers];
}
