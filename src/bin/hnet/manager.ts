import { formatDuration, formatMoney } from '/lib/Helpers';
import { NodeStats, NS } from 'Bitburner';
import { config } from '/lib/Config';

let formulas = true;
let haveHacknetServers = true;
let options: { [x: string]: any; c: any; continuous: any; interval: any; toast: any };

export async function main(ns: NS) {
  options = config('hack_net');
  const continuous = options.c || options.continuous;
  const interval = options.interval;
  let maxSpend = options['max-spend'];
  let maxPayoffTime = options['time'] || options['max-payoff-time'];
  // A little string parsing to be more user friendly
  if (maxPayoffTime && String(maxPayoffTime).endsWith('m'))
    maxPayoffTime = Number.parseFloat(maxPayoffTime.replace('m', '')) * 60;
  else if (maxPayoffTime && String(maxPayoffTime).endsWith('h'))
    maxPayoffTime = Number.parseFloat(maxPayoffTime.replace('h', '')) * 3600;
  else maxPayoffTime = Number.parseFloat(maxPayoffTime);
  ns.disableLog('ALL');

  let formulas = true;
  log(
    ns,
    `Starting hacknet-upgrade-manager with purchase payoff time limit of ${formatDuration(maxPayoffTime * 1000)} and ` +
      (maxSpend == Number.MAX_VALUE ? 'no spending limit' : `a spend limit of ${formatMoney(maxSpend)}`) +
      `. Current fleet: ${ns.hacknet.numNodes()} nodes...`
  );
  do {
    var spend: number = parseInt((upgradeHacknet(ns, maxSpend, maxPayoffTime) ?? 0).toString());
    // Using this method, we cannot know for sure that we don't have hacknet servers until we have purchased one
    if (haveHacknetServers && ns.hacknet.numNodes() > 0 && ns.hacknet.hashCapacity() == 0) haveHacknetServers = false;
    if (maxSpend && spend === 0) {
      log(ns, `Spending limit reached. Breaking...`);
      break; // Hack, but we return a non-number (false) when we've bought all we can for the current config
    }
    if (ns.hacknet.numHashes() > 400) {
      while (true) {
        if (ns.hacknet.numHashes() > 100) {
          ns.hacknet.spendHashes('Sell for Money');
        } else {
          break;
        }
        await ns.asleep(100);
      }
    }

    maxSpend -= spend;
    if (continuous) await ns.sleep(interval);
  } while (continuous);
}

let lastUpgradeLog = '';
function log(ns, logMessage) {
  if (logMessage != lastUpgradeLog) ns.print((lastUpgradeLog = logMessage));
}

// Will buy the most effective hacknet upgrade, so long as it will pay for itself in the next {payoffTimeSeconds} seconds.
export function upgradeHacknet(ns: NS, maxSpend: number, maxPayoffTimeSeconds = 3600 /* 3600 sec == 1 hour */) {
  const currentHacknetMult = ns.getPlayer().hacknet_node_money_mult;
  // Get the lowest cache level, we do not consider upgrading the cache level of servers above this until all have the same cache level
  const minCacheLevel = [...Array(ns.hacknet.numNodes()).keys()].reduce(
    (min, i) => Math.min(min, ns.hacknet.getNodeStats(i).cache),
    Number.MAX_VALUE
  );
  // TODO: Change this all to use https://bitburner.readthedocs.io/en/latest/netscript/formulasapi/hacknetServers/hashGainRate.html
  const upgrades = [
    {
      name: 'none',
      upgrade: ns.hacknet.upgradeLevel,
      cost: (i: number) => 0,
      nextValue: (nodeStats: NodeStats) => nodeStats.level + 1,
      addedProduction: (nodeStats: NodeStats) => nodeStats.production * ((nodeStats.level + 1) / nodeStats.level - 1),
    },
    {
      name: 'level',
      upgrade: ns.hacknet.upgradeLevel,
      cost: (i: number) => ns.hacknet.getLevelUpgradeCost(i, 1),
      nextValue: (nodeStats: NodeStats) => nodeStats.level + 1,
      addedProduction: (nodeStats: NodeStats) => nodeStats.production * ((nodeStats.level + 1) / nodeStats.level - 1),
    },
    {
      name: 'ram',
      upgrade: ns.hacknet.upgradeRam,
      cost: (i: number) => ns.hacknet.getRamUpgradeCost(i, 1),
      nextValue: (nodeStats: NodeStats) => nodeStats.ram * 2,
      addedProduction: (nodeStats: NodeStats) => nodeStats.production * 0.07,
    },
    {
      name: 'cores',
      upgrade: ns.hacknet.upgradeCore,
      cost: (i: number) => ns.hacknet.getCoreUpgradeCost(i, 1),
      nextValue: (nodeStats: NodeStats) => nodeStats.cores + 1,
      addedProduction: (nodeStats: NodeStats) =>
        nodeStats.production * ((nodeStats.cores + 5) / (nodeStats.cores + 4) - 1),
    },
    {
      name: 'cache',
      upgrade: ns.hacknet.upgradeCache,
      cost: (i: number) => ns.hacknet.getCacheUpgradeCost(i, 1),
      nextValue: (nodeStats: NodeStats) => nodeStats.cache + 1,
      addedProduction: (nodeStats: NodeStats) =>
        nodeStats.cache > minCacheLevel || !haveHacknetServers ? 0 : (nodeStats.production * 0.01) / nodeStats.cache, // Note: Does not actually give production, but it has "worth" to us so we can buy more things
    },
  ];
  // Find the best upgrade we can make to an existing node
  let nodeToUpgrade = -1;
  let bestUpgrade;
  let bestUpgradePayoff = 0; // Hashes per second per dollar spent. Bigger is better.
  let cost = 0;
  let upgradedValue = 0;
  let worstNodeProduction = Number.MAX_VALUE; // Used to how productive a newly purchased node might be
  for (var i = 0; i < ns.hacknet.numNodes(); i++) {
    let nodeStats = ns.hacknet.getNodeStats(i);
    if (formulas && haveHacknetServers) {
      // When a hacknet server runs scripts, nodeStats.production lags behind what it should be for current ram usage. Get the "raw" rate
      try {
        nodeStats.production = ns.formulas.hacknetServers.hashGainRate(
          nodeStats.level,
          0,
          nodeStats.ram,
          nodeStats.cores,
          currentHacknetMult
        );
      } catch {
        formulas = false;
      }
    }
    worstNodeProduction = Math.min(worstNodeProduction, nodeStats.production);
    for (let up = 1; up < upgrades.length; up++) {
      let currentUpgradeCost = upgrades[up].cost(i);
      let payoff = upgrades[up].addedProduction(nodeStats) / currentUpgradeCost; // Production (Hashes per second) per dollar spent
      if (payoff > bestUpgradePayoff) {
        nodeToUpgrade = i;
        bestUpgrade = upgrades[up];
        bestUpgradePayoff = payoff;
        cost = currentUpgradeCost;
        upgradedValue = upgrades[up].nextValue(nodeStats);
      }
    }
  }
  // Compare this to the cost of adding a new node. This is an imperfect science. We are paying to unlock the ability to buy all the same upgrades our
  // other nodes have - all of which have been deemed worthwhile. Not knowing the sum total that will have to be spent to reach that same production,
  // the "most optimistic" case is to treat "price" of all that production to be just the cost of this server, but this is **very** optimistic.
  // In practice, the cost of new hacknodes scales steeply enough that this should come close to being true (cost of server >> sum of cost of upgrades)
  let newNodeCost = ns.hacknet.getPurchaseNodeCost();
  let newNodePayoff = ns.hacknet.numNodes() == ns.hacknet.maxNumNodes() ? 0 : worstNodeProduction / newNodeCost;
  let shouldBuyNewNode = newNodePayoff > bestUpgradePayoff;
  if (newNodePayoff == 0 && bestUpgradePayoff == 0) {
    log(ns, `All upgrades have no value (is hashNet income disabled in this BN?)`);
    return false; // As long as maxSpend doesn't change, we will never purchase another upgrade
  }
  // If specified, only buy upgrades that will pay for themselves in {payoffTimeSeconds}.
  const hashDollarValue = haveHacknetServers ? 2.5e5 : 1; // Dollar value of one hash-per-second (0.25m dollars per production).
  let payoffTimeSeconds = 1 / (hashDollarValue * (shouldBuyNewNode ? newNodePayoff : bestUpgradePayoff));
  if (shouldBuyNewNode) cost = newNodeCost;

  // Prepare info about the next uprade. Whether we end up purchasing or not, we will display this info.
  let strPurchase =
    (shouldBuyNewNode
      ? `a new node "hacknet-node-${ns.hacknet.numNodes()}"`
      : `hacknet-node-${nodeToUpgrade} ${bestUpgrade.name} ${upgradedValue}`) + ` for ${formatMoney(cost)}`;
  let strPayoff = `production ${((shouldBuyNewNode ? newNodePayoff : bestUpgradePayoff) * cost).toPrecision(
    3
  )} payoff time: ${formatDuration(1000 * payoffTimeSeconds)}`;
  if (cost > maxSpend) {
    log(
      ns,
      `The next best purchase would be ${strPurchase} but the cost ${formatMoney(
        cost
      )} exceeds the limit (${formatMoney(maxSpend)})`
    );
    return false; // As long as maxSpend doesn't change, we will never purchase another upgrade
  }
  if (payoffTimeSeconds > maxPayoffTimeSeconds) {
    log(
      ns,
      `The next best purchase would be ${strPurchase} but the ${strPayoff} is worse than the limit (${formatDuration(
        1000 * maxPayoffTimeSeconds
      )})`
    );
    return false; // As long as maxPayoffTimeSeconds doesn't change, we will never purchase another upgrade
  }
  let success = shouldBuyNewNode ? ns.hacknet.purchaseNode() !== -1 : bestUpgrade.upgrade(nodeToUpgrade, 1);
  if (success && options.toast) ns.toast(`Purchased ${strPurchase}`, 'success');
  log(
    ns,
    success
      ? `Purchased ${strPurchase} with ${strPayoff}`
      : `Insufficient funds to purchase the next best upgrade: ${strPurchase}`
  );
  return success ? cost : 0;
}
