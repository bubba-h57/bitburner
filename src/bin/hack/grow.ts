import { NS } from "Bitburner";

/** @param {NS } ns */
export async function main(ns: NS) {
    if (ns.args[0] === undefined || ns.args[0] === '') {
        ns.tprint('ERROR You must pass in a target.');
    }

    let target: string = ns.args[0].toString();
    ns.tprint(`INFO Targeting ${target}`);
    let maxMoney: number = ns.getServerMaxMoney(target);
    let currMoney: number = ns.getServerMoneyAvailable(target);
    while (currMoney < maxMoney) {
        ns.tprint(`WARN Current Money: ${currMoney} / ${maxMoney}`);
        await ns.grow(target);
        currMoney = ns.getServerMoneyAvailable(target);
    }
    ns.tprint(`ERROR Current Money: ${currMoney} / ${maxMoney}`);
}
