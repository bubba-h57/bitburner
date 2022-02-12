import { NS } from "Bitburner";
import { Mafia } from "/lib/Mafia.js";
import { disableLogs } from "/lib/Helpers.js";

export async function main(ns: NS) {
    disableLogs(ns, [
        'gang.purchaseEquipment',
        'gang.setMemberTask',
        'getServerMoneyAvailable',
        'sleep'
    ]);
    const updateInterval = 200;
    ns.tail();

    let mafia: Mafia = new Mafia(ns);

    while (true) {
        mafia.recruit();
        mafia.manage();
        await ns.sleep(updateInterval);
    }
}
