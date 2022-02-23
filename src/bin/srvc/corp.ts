import { NS, CorporationInfo, Division, Product } from 'Bitburner';
import { formatDateTime } from '/lib/Helpers';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.tail();
  let corp: CorporationInfo;

  if (!ns.getPlayer().hasCorporation) {
    ns.print('This script expects you have already setup the corporation.');
  }
  corp = ns.corporation.getCorporation();

  if (corp.divisions.length < 2) {
    ns.print(
      'No, Really. This script expects you have already setup the corporation with Agriculture and Tobacco divisions.'
    );
  }

  while (true) {
    let products: Product[] = [];
    let maxProducts: number = 3;
    let oldestProductName: string;
    let currentProduct: Product;
    let tobaccoDivision: Division;
    corp = ns.corporation.getCorporation();

    // Tobacco Management
    tobaccoDivision = getDivision(corp, 'Tobacco');
    products = getProducts(ns, tobaccoDivision);
    oldestProductName = findOldestProduct(ns, tobaccoDivision);
    currentProduct = findCurrentProduct(products);

    let developing = false;

    products.reverse().forEach((product: Product) => {
      if (product.developmentProgress < 100) {
        ns.print(`${tobaccoDivision.name} - ${product.name} - Progress: ${product.developmentProgress.toFixed(2)}`);
        developing = true;
        return;
      }
      if (product.sCost == 0) {
        ns.print(`Start selling ${product.name} `);
        ns.corporation.sellProduct(tobaccoDivision.name, 'Sector-12', product.name, 'MAX', 'MP', true);
        if (ns.corporation.hasResearched(tobaccoDivision.name, 'Market-TA.II')) {
          ns.corporation.setProductMarketTA1(tobaccoDivision.name, product.name, false);
          ns.corporation.setProductMarketTA2(tobaccoDivision.name, product.name, true);
        }
      }
    });

    if (ns.corporation.hasResearched(tobaccoDivision.name, 'uPgrade: Capacity.I')) {
      maxProducts++;
      if (ns.corporation.hasResearched(tobaccoDivision.name, 'uPgrade: Capacity.II')) {
        maxProducts++;
      }
    }

    if (!developing && ns.corporation.getDivision(tobaccoDivision.name).products.length >= maxProducts) {
      ns.print('Discontinue product ' + oldestProductName);
      ns.corporation.discontinueProduct(tobaccoDivision.name, oldestProductName);
    }
    if (!developing && ns.corporation.getDivision(tobaccoDivision.name).products.length < maxProducts) {
      const newProductName = 'Product-' + formatDateTime(new Date());
      let productInvest = 1e9;
      if (ns.corporation.getCorporation().funds < 2 * productInvest) {
        if (ns.corporation.getCorporation().funds <= 0) {
          ns.print(
            'WARN negative funds, cannot start new product development ' +
              ns.nFormat(ns.corporation.getCorporation().funds, '0.0a')
          );
          return;
        } else {
          productInvest = Math.floor(ns.corporation.getCorporation().funds / 2);
        }
      }
      ns.print('Start new product development ' + newProductName);
      ns.corporation.makeProduct(tobaccoDivision.name, 'Aevum', newProductName, productInvest, productInvest);
    }
    await ns.sleep(20000);
  }
}

function getProducts(ns: NS, division: Division): Product[] {
  return division.products.map((name: string) => {
    return ns.corporation.getProduct(division.name, name);
  });
}
function getDivision(corp: CorporationInfo, name: string): Division {
  return (
    corp.divisions.find((division: Division, index: number, obj: Division[]) => {
      return division.type === name;
    }) || empty
  );
}

function findOldestProduct(ns: NS, division: Division): string {
  return ns.corporation.getDivision(division.name).products[0];
}

function findCurrentProduct(products: Product[]): Product {
  let result: Product = products[products.length - 1];
  products.forEach((product: Product) => {
    if (product.developmentProgress < 100) {
      result = product;
      return;
    }
  });
  return result;
}

/**
 * Corporation division
 * @public
 */
var empty: Division = {
  /** Name of the division */
  name: 'empty',
  /** Type of division, like Agriculture */
  type: 'none',
  /** Awareness of the division */
  awareness: 0,
  /** Popularity of the division */
  popularity: 0,
  /** Production multiplier */
  prodMult: 0,
  /** Amount of research in that division */
  research: 0,
  /** Revenue last cycle */
  lastCycleRevenue: 0,
  /** Expenses last cycle */
  lastCycleExpenses: 0,
  /** Revenue this cycle */
  thisCycleRevenue: 0,
  /** Expenses this cycle */
  thisCycleExpenses: 0,
  /** All research bought */
  upgrades: [2, 3, 4, 5],
  /** Cities in which this division has expanded */
  cities: ['yea', 'not', 'really'],
  /** Products developed by this division */
  products: ['yea', 'not', 'really'],
};
