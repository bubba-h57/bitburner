import { findPath, getAllServers } from "lib/servers.js";
import renderCustomModal, { getDoc, EventHandlerQueue } from "lib/window.js";

function getColorScale(v) {
  return `hsl(${Math.max(0, Math.min(1, v)) * 130}, 100%, 50%)`;
}

const toolbarStyles = {
  lineHeight: "30px",
  alignItems: "center",
  display: "flex",
  gap: 16,
  margin: 8,
};

export async function main(ns) {
  console.log("Started monitor");
  const eventQueue = new EventHandlerQueue();

  const servers = getAllServers(ns);
  servers.splice(0, 0, { hostname: "home", route: [] });

  while (true) {
    /** @type {import(".").ReactElement } element */
    const element = window.React.createElement(
      "<span>",
      {},
      "Bubba is doing it"
    );
    const container = React.createElement("div", {}, element);

    renderCustomModal(ns, container);

    await eventQueue.executeEvents();
    await ns.sleep(1_000);
  }
}
