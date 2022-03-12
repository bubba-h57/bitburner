import { NodeStats, NS } from 'Bitburner';
import { HacknetServer } from '/lib/HacknetServer';

export class Hacknet {
  public ns: NS;
  public formulas: boolean = true;

  constructor(ns: NS) {
    this.ns = ns;
  }

  public nodeStats(): NodeStats[] {
    let nodeStats: NodeStats[] = [];
    for (var i = 0; i < this.ns.hacknet.numNodes(); i++) {
      nodeStats.push(this.ns.hacknet.getNodeStats(i));
    }
    return nodeStats;
  }

  public hacknetServers(): HacknetServer[] {
    let hacknetServers: HacknetServer[] = [];
    for (var i = 0; i < this.ns.hacknet.numNodes(); i++) {
      hacknetServers.push(new HacknetServer(this.ns, this.ns.hacknet.getNodeStats(i), i));
    }
    return hacknetServers;
  }

  public upgradeForHashGain() {
    this.hacknetServers().forEach(function (server: HacknetServer) {
      server.upgradeForHashGain();
    });
  }

  public purchaseNew() {
    if (this.ns.hacknet.purchaseNode() !== -1) {
      this.ns.print(`Purchased new hacknet node`);
    }
  }
}
