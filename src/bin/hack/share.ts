import { NS } from "Bitburner";

export async function main(ns: NS) {
    ns.tail();
    while (true){
        await ns.share();
    }
}
