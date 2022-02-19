import type React_Type from 'react';
import { findPath, getAllServers } from '/lib/Servers.js';
import renderCustomModal, { doc, EventHandlerQueue } from '/lib/Window.js';

declare var React: typeof React_Type;

function getColorScale(v) {
  return `hsl(${Math.max(0, Math.min(1, v)) * 130}, 100%, 50%)`;
}

const toolbarStyles = {
  lineHeight: '30px',
  alignItems: 'center',
  display: 'flex',
  gap: 16,
  margin: 8,
};

export async function main(ns) {
  ns.tail();
  console.log('Started monitor');
  const eventQueue = new EventHandlerQueue();

  const servers = getAllServers(ns);

  while (true) {
    renderCustomModal(ns, <div>Hello bitburner!</div>);

    await eventQueue.executeEvents();
    await ns.sleep(1_000);
  }
}
