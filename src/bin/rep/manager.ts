// import { formatDuration, formatMoney, formatNumberShort } from '/lib/Helpers.js';
// import { config } from '/lib/Config.js';
// import { NS, SourceFileLvl } from 'Bitburner';
// import { SourceFiles } from '/lib/SourceFiles.js';

// export async function main(ns: NS) {
//   ns.tail();
//   let sourceFiles: SourceFiles = new SourceFiles(ns);

//   if (sourceFiles.doesNotHaveSourceFile(4))
//     return ns.tprint(
//       'ERROR: You cannot automate working for factions until you have unlocked singularity access (SF4).'
//     );
//   else if (sourceFiles.level(4) < 3)
//     ns.tprint(
//       `WARNING: Singularity functions are much more expensive with lower levels of SF4 (you have SF4.${sourceFiles.level(
//         4
//       )}). ` +
//         `You may encounter RAM issues with and have to wait until you have more RAM available to run this script successfully.`
//     );

//   let bitnodeMults = await tryGetBitNodeMultipliers(ns); // Find out the current bitnode multipliers (if available)
//   repToDonate = 150 * (bitnodeMults?.RepToDonateToFaction || 1);
//   crimeCount = 0;

//   // Get some information about gangs (if unlocked)
//   if (sourceFiles.hasSourceFile(2)) {
//     const gangInfo = await getNsDataThroughFile(
//       ns,
//       'ns.gang.inGang() ? ns.gang.getGangInformation() : false',
//       '/Temp/gang-stats.txt'
//     );
//     if (gangInfo && gangInfo.faction) {
//       playerGang = gangInfo.faction;
//       let configGangIndex = preferredEarlyFactionOrder.findIndex((f) => f === 'Slum Snakes');
//       if (playerGang && configGangIndex != -1)
//         // If we're in a gang, don't need to earn an invite to slum snakes anymore
//         preferredEarlyFactionOrder.splice(configGangIndex, 1);
//       allGangFactions =
//         (await getNsDataThroughFile(ns, 'Object.keys(ns.gang.getOtherGangInformation())', '/Temp/gang-names.txt')) ||
//         [];
//     }
//   }
// }
