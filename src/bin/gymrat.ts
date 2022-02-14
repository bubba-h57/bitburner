import { NS } from "Bitburner";

export async function main(ns: NS) {
    const combatTarget = 500;
    const gym = 'Snap Fitness Gym';
    const sleepInterval = 60000
    const charismaTarget = 500;
    ns.tail();

    const statistics = ['strength', 'agility', 'defense', 'dexterity'];
    let trainNext = statistics.reduce((previous: string, current: string) => {
        return ns.getPlayer()[current] <= ns.getPlayer()[previous] ? current : previous;
    })
    ns.travelToCity('Aevum');


    while (ns.getPlayer()[trainNext] < combatTarget) {
        ns.gymWorkout(gym, trainNext);
        await ns.sleep(sleepInterval);
        trainNext = statistics.reduce((previous: string, current: string) => {
            return ns.getPlayer()[current] <= ns.getPlayer()[previous] ? current : previous;
        })
    }

    ns.travelToCity('Volhaven');
    while (ns.getPlayer().charisma < charismaTarget) {
        ns.universityCourse('ZB Institute Of Technology', 'Leadership');
        await ns.sleep(sleepInterval * (charismaTarget - ns.getPlayer().charisma));
    }
}
