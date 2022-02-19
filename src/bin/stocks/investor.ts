import { NS } from 'Bitburner';

export async function main(ns: NS) {
  var maxSharePer = 1.0;
  var stockBuyPer = 0.6;
  var stockVolPer = 0.05;
  var moneyKeep = 1000000000;
  var minSharePer = 5;

  while (true) {
    ns.disableLog('disableLog');
    ns.disableLog('sleep');
    ns.disableLog('getServerMoneyAvailable');
    var stocks = ns.stock.getSymbols();
    for (const stock of stocks) {
      var position = ns.stock.getPosition(stock);
      if (position[0]) {
        sellPositions(stock);
      }
      buyPositions(stock);
    }
    ns.print('Cycle Complete');
    await ns.sleep(6000);
  }
  function buyPositions(stock: string) {
    var maxShares = ns.stock.getMaxShares(stock) * maxSharePer - position[0];
    var askPrice = ns.stock.getAskPrice(stock);
    var forecast = ns.stock.getForecast(stock);
    var volPer = ns.stock.getVolatility(stock);
    var playerMoney = ns.getServerMoneyAvailable('home');

    if (forecast >= stockBuyPer && volPer <= stockVolPer) {
      if (playerMoney - moneyKeep > ns.stock.getPurchaseCost(stock, minSharePer, 'Long')) {
        var shares = Math.min((playerMoney - moneyKeep - 100000) / askPrice, maxShares);
        ns.stock.buy(stock, shares);
      }
    }
  }
  function sellPositions(stock: string) {
    var forecast = ns.stock.getForecast(stock);
    if (forecast < 0.5) {
      ns.stock.sell(stock, position[0]);
    }
  }
}
