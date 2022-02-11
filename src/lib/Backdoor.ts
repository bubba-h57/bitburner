import { NS } from "Bitburner";
import { findPath } from "/lib/Servers.js";

export async function backdoor(ns: NS, host: string) {
    let server = ns.getServer(host);

    if (server.backdoorInstalled || server.requiredHackingSkill > ns.getHackingLevel()) {
        return;
    }

    let path = await findPath(ns, host);
    path.forEach((host: string) => ns.connect(host));

    await ns.installBackdoor();

    path.pop();
    path.reverse();
    path.push("home");
    path.forEach((host: string) => ns.connect(host));
}
