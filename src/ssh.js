import { findPath } from "lib/servers.js";

/** @param {import(".").NS } ns */
export async function main(ns) {
  let path = await findPath(ns, ns.args[0]);
  let output = "home;";

  path.forEach((hostname) => (output += " connect " + hostname + ";"));

  const terminalInput = document.getElementById("terminal-input");
  terminalInput.value = output;
  const handler = Object.keys(terminalInput)[1];
  terminalInput[handler].onChange({ target: terminalInput });
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
}

export function autocomplete(data, args) {
  return [...data.servers];
}
