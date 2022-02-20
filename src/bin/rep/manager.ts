// import { formatDuration, formatMoney, formatNumberShort } from '/lib/Helpers.js';
// import { config } from '/lib/Config.js';
// import { NS } from 'Bitburner';

// export function autocomplete(data, args) {
//   data.flags(config('factions.arguments.schema'));
//   const lastFlag = args.length > 1 ? args[args.length - 2] : null;
//   if (lastFlag == '--first' || lastFlag == '--skip')
//     return config('factions.list')
//       .map((f) => f.replaceAll(' ', '_'))
//       .sort();
//   return [];
// }

// export async function main(ns: NS) {
//   ns.tail();
//   let options = ns.flags(config('factions.arguments.schema'));
//   const desiredAugStats = options['desired-stats'] || [];
//   const firstFactions = (options.first = (options.first || []).map((f) => f.replaceAll('_', ' ')));
//   let skipFactionsConfig = (options.skip = (options.skip || []).map((f) => f.replaceAll('_', ' ')));
//   let noFocus = options['no-focus'];
//   let noStudying = options['no-studying'] || noFocus; // Can't study if we aren't allowed to steal focus
//   let noCrime = options['no-crime'] || noFocus; // Can't crime if we aren't allowed to steal focus
//   let crimeFocus = options['crime-focus'];
//   let prioritizeInvites = options['prioritize-invites'];
//   if (crimeFocus && noFocus)
//     return ns.tprint('ERROR: Cannot use --no-focus and --crime-focus at the same time. You need to focus to do crime!');
//   if (desiredAugStats.length == 0)
//     desiredAugStats.push(
//       ...(crimeFocus
//         ? ['str', 'def', 'dex', 'agi', 'faction_rep', 'hacking', 'hacknet']
//         : ['hacking', 'faction_rep', 'company_rep', 'charisma', 'hacknet'])
//     );
//   let fastCrimesOnly = options['fast-crimes-only'];
//   // Log command line args used
//   if (firstFactions.length > 0) ns.print(`--first factions: ${firstFactions.join(', ')}`);
//   if (skipFactionsConfig.length > 0) ns.print(`--skip factions: ${skipFactionsConfig.join(', ')}`);
//   if (desiredAugStats.length > 0) ns.print(`--desired-stats matching: ${desiredAugStats.join(', ')}`);
//   if (fastCrimesOnly) ns.print(`--fast-crimes-only`);

//   let dictSourceFiles = ns.getOwnedSourceFiles();
//   if (!(4 in dictSourceFiles))
//     return ns.tprint(
//       'ERROR: You cannot automate working for factions until you have unlocked singularity access (SF4).'
//     );
//   else if (dictSourceFiles[4].lvl < 3)
//     ns.tprint(
//       `WARNING: Singularity functions are much more expensive with lower levels of SF4 (you have SF4.${dictSourceFiles[4]}). ` +
//         `You may encounter RAM issues with and have to wait until you have more RAM available to run this script successfully.`
//     );

//   let bitnodeMults = ns.getBitNodeMultipliers(); // Find out the current bitnode multipliers (if available)
//   let repToDonate = 150 * (bitnodeMults?.RepToDonateToFaction || 1);
//   let crimeCount = 0;

//   // Get some information about gangs (if unlocked)
//   if (2 in dictSourceFiles) {
//     const gangInfo = ns.gang.getGangInformation();
//     if (gangInfo && gangInfo.faction) {
//       let playerGang = gangInfo.faction;
//       let configGangIndex = config('factions.order.preferred.early_faction').findIndex((f) => f === 'Slum Snakes');
//       if (playerGang && configGangIndex != -1)
//         // If we're in a gang, don't need to earn an invite to slum snakes anymore
//         config('factions.order.preferred.early_faction').splice(configGangIndex, 1);
//       let allGangFactions = ns.gang.getOtherGangInformation();
//     }
//   }

//   // Get some augmentation information to decide what remains to be purchased

//   const dictFactionAugs: string[][] = config('factions.list').map((o: string) => ns.getAugmentationsFromFaction(o));
//   const augmentationNames: string[] = [...new Set(Object.values(dictFactionAugs).flat())];
//   const dictAugRepReqs = augmentationNames.map((o: string) => ns.getAugmentationRepReq(o));
//   const dictAugStats = augmentationNames.map((o: string) => ns.getAugmentationStats(o));
//   let dictFactionFavors = config('factions.list').map((o: string) => ns.getFactionFavor(o));
//   let ownedAugmentations = ns.getOwnedAugmentations(true);
//   let installedAugmentations = ns.getOwnedAugmentations();
//   let hasFocusPenaly = !installedAugmentations.includes('Neuroreceptor Management Implant'); // Check if we have an augmentation that lets us not have to focus at work (always nicer if we can background it)
//   let shouldFocusAtWork = !noFocus && hasFocusPenaly; // Focus at work for the best rate of rep gain, unless focus activities are disabled via command line

//   let mostExpensiveAugByFaction = Object.fromEntries(
//     config('factions.list').map((f: string) => [
//       f,
//       dictFactionAugs[f]
//         .filter((aug) => !ownedAugmentations.includes(aug))
//         .reduce((max, aug) => Math.max(max, dictAugRepReqs[aug]), -1),
//     ])
//   );
//   //ns.print("Most expensive unowned aug by faction: " + JSON.stringify(mostExpensiveAugByFaction));
//   // TODO: Detect when the most expensive aug from two factions is the same - only need it from the first one. (Update lists and remove 'afforded' augs?)
//   let mostExpensiveDesiredAugByFaction = Object.fromEntries(
//     config('factions.list').map((f) => [
//       f,
//       dictFactionAugs[f]
//         .filter(
//           (aug) =>
//             !ownedAugmentations.includes(aug) &&
//             (Object.keys(dictAugStats[aug]).length == 0 ||
//               !desiredAugStats ||
//               Object.keys(dictAugStats[aug]).some((key) => desiredAugStats.some((stat) => key.includes(stat))))
//         )
//         .reduce((max, aug) => Math.max(max, dictAugRepReqs[aug]), -1),
//     ])
//   );

//   //ns.print("Most expensive desired aug by faction: " + JSON.stringify(mostExpensiveDesiredAugByFaction));
//   let completedFactions = Object.keys(mostExpensiveAugByFaction).filter(
//     (fac) =>
//       mostExpensiveAugByFaction[fac] == -1 && !config('factions.config.faction').find((c) => c.name == fac)?.forceUnlock
//   );
//   let skipFactions = skipFactionsConfig.concat(completedFactions);
//   let softCompletedFactions = Object.keys(mostExpensiveDesiredAugByFaction).filter(
//     (fac) =>
//       mostExpensiveDesiredAugByFaction[fac] == -1 &&
//       !completedFactions.includes(fac) &&
//       !config('factions.config.faction').find((c) => c.name == fac)?.forceUnlock
//   );
//   if (completedFactions.length > 0)
//     ns.print(
//       `${completedFactions.length} factions are completed (all augs purchased): ${completedFactions.join(', ')}`
//     );
//   if (softCompletedFactions.length > 0)
//     ns.print(
//       `${
//         softCompletedFactions.length
//       } factions will initially be skipped (all desired augs purchased): ${softCompletedFactions.join(', ')}`
//     );

//   let scope = 0; // Scope increases each time we complete a type of work and haven't progressed enough to unlock more factions
//   let numJoinedFactions = ns.getPlayer().factions.length;
//   while (true) {
//     // After each loop, we will repeat all prevous work "strategies" to see if anything new has been unlocked, and add one more "strategy" to the queue
//     scope++;
//     ns.print(`INFO: Starting main work loop with scope: ${scope}...`);
//     const player = ns.getPlayer();
//     if (player.factions.length > numJoinedFactions) {
//       // If we've recently joined a new faction, reset our work scope
//       scope = 1; // Back to basics until we've satisfied all highest-priority work
//       numJoinedFactions = player.factions.length;
//     }

//     // Remove Fulcrum from our "EarlyFactionOrder" if hack level is insufficient to backdoor their server
//     let priorityFactions = crimeFocus
//       ? config('factions.order.preferred.crime_faction').slice()
//       : config('factions.order.preferred.crime_faction').slice();
//     let fulcrummHackReq = ns.getServerRequiredHackingLevel('fulcrumassets');
//     if (player.hacking < fulcrummHackReq - 10) {
//       // Assume that if we're within 10, we'll get there by the time we've earned the invite
//       priorityFactions.splice(
//         priorityFactions.findIndex((c) => c == 'Fulcrum Secret Technologies'),
//         1
//       );
//       ns.print(
//         `Fulcrum faction server requires ${fulcrummHackReq} hack, so removing from our initial priority list for now.`
//       );
//     } // TODO: Otherwise, if we get Fulcrum, we have no need for a couple other company factions
//     // Strategy 1: Tackle a consolidated list of desired faction order, interleaving simple factions and megacorporations
//     const factionWorkOrder = firstFactions
//       .concat(priorityFactions.filter((f) => !firstFactions.includes(f) && !skipFactions.includes(f)))
//       .filter((f) => !softCompletedFactions.includes(f)); // Remove factions from our initial "work order" if we've bought all desired augmentations.
//     for (const faction of factionWorkOrder) {
//       let earnedNewFactionInvite = false;
//       if (config('factions.order.preferred.company_faction').includes(faction))
//         // If this is a company faction, we need to work for the company first
//         earnedNewFactionInvite = (await workForMegacorpFactionInvite(ns, faction, true, options)) ?? false;
//       // If new work was done for a company or their faction, restart the main work loop to see if we've since unlocked a higher-priority faction in the list
//       if (earnedNewFactionInvite || (await workForSingleFaction(ns, faction, options))) {
//         scope--; // De-increment scope so that effecitve scope doesn't increase on the next loop (i.e. it will be incrementedback to what it is now)
//         break;
//       }
//     }
//     if (scope <= 1) continue;

//     // Strategy 2: Grind XP with all priority factions that are joined or can be joined, until every single one has desired REP
//     for (const faction of factionWorkOrder) await workForSingleFaction(ns, faction, options);
//     if (scope <= 2) continue;

//     // Strategy 3: Work for any megacorporations not yet completed to earn their faction invites. Once joined, we don't lose these factions on reset.
//     let megacorpFactions = config('factions.order.preferred.company_faction').filter((f) => !skipFactions.includes(f));
//     await workForAllMegacorps(ns, megacorpFactions, false, false, options);
//     if (scope <= 3) continue;

//     // Strategy 4: Work for megacorps again, but this time also work for the company factions once the invite is earned
//     await workForAllMegacorps(ns, megacorpFactions, true, false, options);
//     if (scope <= 4) continue;

//     // Strategies 5+ now work towards getting an invite to *all factions in the game* (sorted by least-expensive final aug (correlated to easiest faction-invite requirement))
//     let joinedFactions = player.factions; // In case our hard-coded list of factions is missing anything, merge it with the list of all factions
//     let knownFactions = config('factions.list').concat(
//       joinedFactions.filter((f) => !config('factions.list').includes(f))
//     );
//     let allIncompleteFactions = knownFactions
//       .filter((f) => !skipFactions.includes(f) && !completedFactions.includes(f))
//       .sort((a, b) => mostExpensiveAugByFaction[a] - mostExpensiveAugByFaction[b]);
//     // Strategy 5: For *all factions in the game*, try to earn an invite and work for rep until we can afford the most-expensive *desired* aug (or unlock donations, whichever comes first)
//     for (const faction of allIncompleteFactions.filter((f) => !softCompletedFactions.includes(f)))
//       await workForSingleFaction(ns, faction);
//     if (scope <= 5) continue;

//     // Strategy 6: Revisit all factions until each has enough rep to unlock donations - so if we can't afford all augs this reset, at least we don't need to grind for rep on the next reset
//     // For this, we reverse the order (ones with augs costing the most-rep to least) since these will take the most time to re-grind rep for if we can't buy them this reset.
//     for (const faction of allIncompleteFactions.reverse()) await workForSingleFaction(ns, faction, true);
//     if (scope <= 6) continue;

//     // Strategy 7:  Next, revisit all factions and grind XP until we can afford the most expensive aug, even if we could just buy the required rep next reset
//     for (const faction of allIncompleteFactions.reverse()) // Re-reverse the sort order so we start with the easiest (cheapest) faction augs to complete
//       await workForSingleFaction(ns, faction, true, true);
//     if (scope <= 7) continue;

//     // Strategy 8: Busy ourselves for a while longer, then loop to see if there anything more we can do for the above factions
//     let factionsWeCanWorkFor = knownFactions.filter(
//       (f) => !skipFactionsConfig.includes(f) && !allGangFactions.includes(f)
//     );
//     if (factionsWeCanWorkFor.length > 0 && !crimeFocus) {
//       // Do a little work for whatever faction has the most favor (e.g. to earn EXP and enable additional neuroflux purchases)
//       let mostFavorFaction = factionsWeCanWorkFor.sort((a, b) => dictFactionFavors[b] - dictFactionFavors[a])[0];
//       let targetRep = 1000 + ns.getFactionRep(mostFavorFaction) * 1.05; // Hack: Grow rep by ~5%, plus 1000 incase it's currently 0
//       ns.print(
//         `INFO: All useful work complete. Grinding an additional 5% rep (to ${formatNumberShort(
//           targetRep
//         )}) with highest-favor faction: ${mostFavorFaction} (${dictFactionFavors[mostFavorFaction]?.toFixed(2)} favor)`
//       );
//       await workForSingleFaction(ns, mostFavorFaction, false, false, targetRep);
//     } else if (!noCrime) {
//       // Otherwise, kill some time by doing crimes for a little while
//       ns.print(`INFO: Nothing to do. Doing a little crime...`);
//       await crimeForKillsKarmaStats(ns, 0, -ns.heart.break() + 100 /* Hack: Decrease Karma by 100 */, 0);
//     } else {
//       // If our hands our tied, twiddle our thumbs a bit
//       ns.print(`INFO: Nothing to do. Sleeping for 30 seconds to see if magically we join a faction`);
//       await ns.sleep(30000);
//     }
//     if (scope <= 8) scope--; // Cap the 'scope' value from increasing perpetually when we're on our last strategy

//     await ns.sleep(1); // Infinite loop protection in case somehow we loop without doing any meaningful work
//   }
// }

// // Ram-dodging helper, runs a command for all items in a list and returns a dictionary.
// const dictCommand = (list, command) => `Object.fromEntries(${JSON.stringify(list)}.map(o => [o, ${command}]))`;

// /** @param {NS} ns
//  * Prints a message, and also toasts it! */
// function announce(ns, log, toastVariant = 'info') {
//   if (!ns.print || !ns.toast) return; // If an error is caught/logged because the script is being killed, ns becomes undefined
//   ns.print(`${toastVariant}: ${log}`);
//   ns.toast(log, toastVariant);
// }

// const requiredMoneyByFaction = {
//   'Tian Di Hui': 1e6,
//   'Sector-12': 15e6,
//   Chongqing: 20e6,
//   'New Tokyo': 20e6,
//   Ishima: 30e6,
//   Aevum: 40e6,
//   Volhaven: 50e6,
//   'Slum Snakes': 1e6,
//   Silhouette: 15e6,
//   'The Syndicate': 10e6,
//   'The Covenant': 75e9,
//   Daedalus: 100e9,
//   Illuminati: 150e9,
// };
// const requiredBackdoorByFaction = {
//   CyberSec: 'CSEC',
//   NiteSec: 'avmnite-02h',
//   'The Black Hand': 'I.I.I.I',
//   BitRunners: 'run4theh111z',
//   'Fulcrum Secret Technologies': 'fulcrumassets',
// };
// const requiredHackByFaction = {
//   'Tian Di Hui': 50,
//   Netburners: 80,
//   'Speakers for the Dead': 100,
//   'The Dark Army': 300,
//   'The Syndicate': 200,
//   'The Covenant': 850,
//   Daedalus: 2500,
//   Illuminati: 1500,
// };
// const requiredCombatByFaction = {
//   'Slum Snakes': 30,
//   Tetrads: 75,
//   'Speakers for the Dead': 300,
//   'The Dark Army': 300,
//   'The Syndicate': 200,
//   'The Covenant': 850,
//   Daedalus: 1500,
//   Illuminati: 1200,
// };
// const requiredKarmaByFaction = {
//   'Slum Snakes': 9,
//   Tetrads: 18,
//   Silhouette: 22,
//   'Speakers for the Dead': 45,
//   'The Dark Army': 45,
//   'The Syndicate': 90,
// };
// const requiredKillsByFaction = { 'Speakers for the Dead': 30, 'The Dark Army': 5 };
// const reqHackingOrCombat = ['Daedalus']; // Special case factions that require only hacking or combat stats, not both

// /** @param {NS} ns */
// async function earnFactionInvite(ns, factionName) {
//   const player = ns.getPlayer();
//   const joinedFactions = player.factions;
//   if (joinedFactions.includes(factionName)) return true;
//   var invitations = await getNsDataThroughFile(ns, 'ns.checkFactionInvitations()', '/Temp/player-faction-invites.txt');
//   if (invitations.includes(factionName)) return await tryJoinFaction(ns, factionName);

//   // Can't join certain factions for various reasons
//   let reasonPrefix = `Cannot join faction "${factionName}" because`;
//   let precludingFaction;
//   if (
//     (['Aevum', 'Sector-12'].includes(factionName) &&
//       (precludingFaction = ['Chongqing', 'New Tokyo', 'Ishima', 'Volhaven'].find((f) => joinedFactions.includes(f)))) ||
//     (['Chongqing', 'New Tokyo', 'Ishima'].includes(factionName) &&
//       (precludingFaction = ['Aevum', 'Sector-12', 'Volhaven'].find((f) => joinedFactions.includes(f)))) ||
//     (['Volhaven'].includes(factionName) &&
//       (precludingFaction = ['Aevum', 'Sector-12', 'Chongqing', 'New Tokyo', 'Ishima'].find((f) =>
//         joinedFactions.includes(f)
//       )))
//   )
//     return ns.print(`${reasonPrefix} precluding faction "${precludingFaction}"" has been joined.`);
//   let requirement;
//   // See if we can take action to earn an invite for the next faction under consideration
//   let workedForInvite = false;
//   // If committing crimes can help us join a faction - we know how to do that
//   let doCrime = false;
//   if ((requirement = requiredKarmaByFaction[factionName]) && -ns.heart.break() < requirement) {
//     ns.print(`${reasonPrefix} you have insufficient Karma. Need: ${-requirement}, Have: ${ns.heart.break()}`);
//     doCrime = true;
//   }
//   if ((requirement = requiredKillsByFaction[factionName]) && player.numPeopleKilled < requirement) {
//     ns.print(`${reasonPrefix} you have insufficient kills. Need: ${requirement}, Have: ${player.numPeopleKilled}`);
//     doCrime = true;
//   }
//   let deficientStats;
//   if (
//     (requirement = requiredCombatByFaction[factionName]) &&
//     (deficientStats = [
//       { name: 'str', value: player.strength },
//       { name: 'str', value: player.defense },
//       { name: 'str', value: player.dexterity },
//       { name: 'str', value: player.agility },
//     ].filter((stat) => stat.value < requirement)).length > 0 &&
//     !(reqHackingOrCombat.includes(factionName) && player.hacking >= requiredHackByFaction[factionName])
//   ) {
//     // Some special-case factions (just 'Daedalus' for now) require *either* hacking *or* combat
//     ns.print(
//       `${reasonPrefix} you have insufficient combat stats. Need: ${requirement} of each, ` +
//         `Have Str: ${player.strength}, Def: ${player.defense}, Dex: ${player.dexterity}, Agi: ${player.agility}`
//     );
//     const em = requirement / 50; // Hack: A rough heuristic suggesting we need an additional x1 multi for every ~50 pysical stat points we wish to grind out in a reasonable amount of time. TODO: Be smarter
//     if (
//       !crimeFocus &&
//       (player.strength_exp_mult * player.strength_mult < em ||
//         player.defense_exp_mult * player.defense_mult < em ||
//         player.dexterity_exp_mult * player.dexterity_mult < em ||
//         player.agility_exp_mult * player.agility_mult < em)
//     )
//       return ns.print('Physical mults / exp_mults are too low to increase stats in a reasonable amount of time');
//     doCrime = true; // TODO: There could be more efficient ways to gain combat stats than homicide, although at least this serves future crime factions
//   }
//   if (doCrime && noCrime)
//     return ns.print(`--no-crime (or --no-focus): Doing crime to meet faction requirements is disabled.`);
//   if (doCrime)
//     workedForInvite = await crimeForKillsKarmaStats(
//       ns,
//       requiredKillsByFaction[factionName] || 0,
//       requiredKarmaByFaction[factionName] || 0,
//       requiredCombatByFaction[factionName] || 0
//     );

//   // Skip factions for which money/hack level requirements aren't met. We do not attempt to "train up" for these things (happens automatically outside this script)
//   if ((requirement = requiredMoneyByFaction[factionName]) && player.money < requirement)
//     return ns.print(
//       `${reasonPrefix} you have insufficient money. Need: ${formatMoney(requirement)}, Have: ${formatMoney(
//         player.money
//       )}`
//     );
//   if (
//     (requirement = requiredHackByFaction[factionName]) &&
//     player.hacking < requirement &&
//     !reqHackingOrCombat.includes(factionName)
//   )
//     return ns.print(`${reasonPrefix} you have insufficient hack level. Need: ${requirement}, Have: ${player.hacking}`);
//   // Note: This only complains if we have insuffient hack to backdoor this faction server. If we have sufficient hack, we will "waitForInvite" below assuming an external script is backdooring ASAP
//   if (
//     (requirement = requiredBackdoorByFaction[factionName]) &&
//     player.hacking < ns.getServerRequiredHackingLevel(requirement)
//   )
//     return ns.print(
//       `${reasonPrefix} you must fist backdoor ${requirement}, which needs hack: ${ns.getServerRequiredHackingLevel(
//         requirement
//       )}, Have: ${player.hacking}`
//     );
//   //await getNsDataThroughFile(ns, `ns.connect('fulcrumassets'); await ns.installBackdoor(); ns.connect(home)`, '/Temp/backdoor-fulcrum.txt') // TODO: Do backdoor if we can but haven't yet?

//   // If travelling can help us join a faction - we can do that too
//   if (['Tian Di Hui', 'Tetrads', 'The Dark Army'].includes(factionName))
//     workedForInvite = await goToCity(ns, 'Chongqing');
//   else if (['The Syndicate'].includes(factionName)) workedForInvite = await goToCity(ns, 'Sector-12');
//   else if (['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven'].includes(factionName))
//     workedForInvite = await goToCity(ns, factionName);
//   // Special case, earn a CEO position to gain an invite to Silhouette
//   if ('Silhouette' == factionName) {
//     ns.print(
//       `You must be a CO (e.g. CEO/CTO) of a company to earn an invite to ${factionName}. This may take a while!`
//     );
//     let factionConfig = companySpecificConfigs.find((f) => f.name == factionName); // We set up Silhouette with a "company-specific-config" so that we can work for an invite like any megacorporation faction.
//     let companyNames = preferredCompanyFactionOrder.map(
//       (f) => companySpecificConfigs.find((cf) => cf.name == f)?.companyName || f
//     );
//     let favorByCompany = await getNsDataThroughFile(
//       ns,
//       dictCommand(companyNames, 'ns.getCompanyFavor(o)'),
//       '/Temp/company-favors.txt'
//     );
//     // Change the company to work for into whichever company we can get to CEO fastest with. Minimize needed_rep/rep_gain_rate. CEO job is at 3.2e6 rep, so (3.2e6-current_rep)/(100+favor).
//     factionConfig.companyName = companyNames.sort(
//       (a, b) =>
//         (3.2e6 - ns.getCompanyRep(a)) / (100 + favorByCompany[a]) -
//         (3.2e6 - ns.getCompanyRep(b)) / (100 + favorByCompany[b])
//     )[0];
//     // Super-hack. Kick off an external script that just loops until it joins the faction, since we can't have concurrent ns calls in here.
//     try {
//       await runCommand(
//         ns,
//         `while(true) { if(ns.joinFaction('${factionName}')) return; else await ns.sleep(1000); }`,
//         '/Temp/join-faction-loop.js'
//       );
//     } catch {
//       ns.print(
//         `WARN: Could not start a temporary script to join ${factionName} when avaialble. (Still running from a previous run?) Proceeding under the assumption something will join for us...`
//       );
//     }
//     workedForInvite = await workForMegacorpFactionInvite(ns, factionName, false); // Work until CTO and the external script joins this faction, triggering an exit condition.
//   }

//   if (workedForInvite)
//     // If we took some action to earn the faction invite, wait for it to come in
//     return await waitForFactionInvite(ns, factionName);
//   else return ns.print(`Noting we can do at this time to earn an invitation to faction "${factionName}"...`);
// }

// /** @param {NS} ns */
// async function goToCity(ns, cityName) {
//   if (ns.getPlayer().city == cityName) {
//     ns.print(`Already in city ${cityName}`);
//     return true;
//   }
//   if (await getNsDataThroughFile(ns, `ns.travelToCity('${cityName}')`, '/Temp/travel.txt')) {
//     lastActionRestart = Date.now();
//     announce(ns, `Travelled to ${cityName}`, 'info');
//     return true;
//   }
//   announce(ns, `Failed to travelled to ${cityName} for some reason...`, 'error');
//   return false;
// }

// /** @param {NS} ns
//  *  @param {function} crimeCommand if you want to commit the RAM footprint, you can pass in ns.commitCrime, otherise it will run via ram-dodging getNsDataThroughFile */
// export async function crimeForKillsKarmaStats(
//   ns,
//   reqKills,
//   reqKarma,
//   reqStats,
//   crimeCommand = null,
//   doFastCrimesOnly = false
// ) {
//   const bestCrimesByDifficulty = ['heist', 'assassinate', 'homicide', 'mug']; // Will change crimes as our success rate improves
//   const chanceThresholds = [0.75, 0.9, 0.5, 0]; // Will change crimes once we reach this probability of success for better all-round gains
//   doFastCrimesOnly = doFastCrimesOnly || fastCrimesOnly;
//   if (!crimeCommand)
//     crimeCommand = async (crime) =>
//       await getNsDataThroughFile(ns, `ns.commitCrime('${crime}')`, '/Temp/crime-time.txt');
//   let player = ns.getPlayer();
//   let strRequirements = [];
//   let forever =
//     reqKills >= Number.MAX_SAFE_INTEGER || reqKarma >= Number.MAX_SAFE_INTEGER || reqStats >= Number.MAX_SAFE_INTEGER;
//   if (reqKills) strRequirements.push(() => `${reqKills} kills (Have ${player.numPeopleKilled})`);
//   if (reqKarma) strRequirements.push(() => `-${reqKarma} Karma (Have ${ns.heart.break()})`);
//   if (reqStats)
//     strRequirements.push(
//       () =>
//         `${reqStats} of each combat stat (Have Str: ${player.strength}, Def: ${player.defense}, Dex: ${player.dexterity}, Agi: ${player.agility})`
//     );
//   let crime, lastCrime, lastStatusUpdateTime;
//   while (
//     forever ||
//     player.strength < reqStats ||
//     player.defense < reqStats ||
//     player.dexterity < reqStats ||
//     player.agility < reqStats ||
//     player.numPeopleKilled < reqKills ||
//     -ns.heart.break() < reqKarma
//   ) {
//     let crimeChances = await getNsDataThroughFile(
//       ns,
//       `Object.fromEntries(${JSON.stringify(bestCrimesByDifficulty)}.map(c => [c, ns.getCrimeChance(c)]))`,
//       '/Temp/crime-chances.txt'
//     );
//     let needStats =
//       player.strength < reqStats ||
//       player.defense < reqStats ||
//       player.dexterity < reqStats ||
//       player.agility < reqStats;
//     let karma = -ns.heart.break();
//     crime =
//       crimeCount < 10
//         ? crimeChances['homicide'] > 0.75
//           ? 'homicide'
//           : 'mug' // Start with a few fast & easy crimes to boost stats if we're just starting
//         : !needStats && (player.numPeopleKilled < reqKills || karma < reqKarma)
//         ? 'homicide' // If *all* we need now is kills or Karma, homicide is the fastest way to do that
//         : bestCrimesByDifficulty.find((c, index) =>
//             doFastCrimesOnly ? index > 1 : crimeChances[c] >= chanceThresholds[index]
//           ); // Otherwise, crime based on success chance vs relative reward (precomputed)
//     if (lastCrime != crime || Date.now() - lastStatusUpdateTime > config('factions.statusUpdateInterval')) {
//       ns.print(
//         `Committing "${crime}" (${(100 * crimeChances[crime]).toPrecision(3)}% success) ` +
//           (forever ? 'forever...' : `until we reach ${strRequirements.map((r) => r()).join(', ')}`)
//       );
//       lastCrime = crime;
//       lastStatusUpdateTime = Date.now();
//     }
//     ns.tail(); // Force a tail window open when auto-criming, or else it's very difficult to stop if it was accidentally closed.
//     await ns.sleep(await crimeCommand(crime));
//     while ((player = ns.getPlayer()).crimeType == `commit ${crime}` || player.crimeType == crime)
//       // If we woke up too early, wait a little longer for the crime to finish
//       await ns.sleep(10);
//     crimeCount++;
//   }
//   ns.print(`Done committing crimes. Reached ${strRequirements.map((r) => r()).join(', ')}`);
//   return true;
// }

// /** @param {NS} ns */
// async function studyForCharisma(ns) {
//   await goToCity(ns, 'Volhaven');
//   if (
//     await getNsDataThroughFile(ns, `ns.universityCourse('ZB Institute Of Technology', 'Leadership')`, '/Temp/study.txt')
//   ) {
//     lastActionRestart = Date.now();
//     announce(ns, `Started studying 'Leadership' at 'ZB Institute Of Technology`, 'success');
//     return true;
//   }
//   announce(ns, `For some reason, failed to study at university (not in correct city?)`, 'error');
//   return false;
// }

// /** @param {NS} ns */
// export async function waitForFactionInvite(ns, factionName, maxWaitTime = 20000) {
//   ns.print(`Waiting for invite from faction "${factionName}"...`);
//   let waitTime = maxWaitTime;
//   do {
//     var invitations = await getNsDataThroughFile(
//       ns,
//       'ns.checkFactionInvitations()',
//       '/Temp/player-faction-invites.txt'
//     );
//     var joinedFactions = ns.getPlayer().factions;
//     if (invitations.includes(factionName) || joinedFactions.includes(factionName)) break;
//     await ns.sleep(loopSleepInterval);
//   } while (!invitations.includes(factionName) && !joinedFactions.includes(factionName) && (waitTime -= 1000) > 0);
//   if (joinedFactions.includes(factionName))
//     // Another script may have auto-joined this faction before we could
//     ns.print(`An external script has joined faction "${factionName}" for us.`);
//   else if (!invitations.includes(factionName))
//     return announce(
//       ns,
//       `Waited ${formatDuration(
//         maxWaitTime
//       )}, but still have not recieved an invite for faction: "${factionName}" (Requirements not met?)`,
//       'error'
//     );
//   else if (!(await tryJoinFaction(ns, factionName)))
//     return announce(
//       ns,
//       `Something went wrong. Earned "${factionName}" faction invite, but failed to join it.`,
//       'error'
//     );
//   return true;
// }

// /** @param {NS} ns */
// export async function tryJoinFaction(ns, factionName) {
//   var joinedFactions = ns.getPlayer().factions;
//   if (joinedFactions.includes(factionName)) return true;
//   if (!(await getNsDataThroughFile(ns, `ns.joinFaction('${factionName}')`, '/Temp/join-faction.txt'))) return false;
//   announce(ns, `Joined faction "${factionName}"`, 'success');
//   return true;
// }

// /** @param {NS} ns */
// async function getCurrentFactionFavour(ns, factionName) {
//   return await getNsDataThroughFile(ns, `ns.getFactionFavor('${factionName}')`, '/Temp/faction-favor.txt');
// }

// let lastFactionWorkStatus = '';
// /** @param {NS} ns
//  * Checks how much reputation we need with this faction to either buy all augmentations or get 150 favour, then works to that amount.
//  * */
// export async function workForSingleFaction(
//   ns: NS,
//   factionName: string,
//   options: any,
//   forceUnlockDonations: boolean = false,
//   forceBestAug: boolean = false,
//   forceRep: boolean = false
// ) {
//   const repToFavour = (rep) => Math.ceil(25500 * 1.02 ** (rep - 1) - 25000);
//   const factionConfig = config('factions.config.faction').find((c) => c.name == factionName);
//   const forceUnlock = factionConfig?.forceUnlock || options.first.includes(factionName);
//   let highestRepAug = forceBestAug
//     ? mostExpensiveAugByFaction[factionName]
//     : mostExpensiveDesiredAugByFaction[factionName];
//   let startingFavor = dictFactionFavors[factionName];
//   let favorRepRequired = Math.max(0, repToFavour(repToDonate) - repToFavour(startingFavor));
//   // When to stop grinding faction rep (usually ~467,000 to get 150 favour) Set this lower if there are no augs requiring that much REP
//   let factionRepRequired = forceRep
//     ? forceRep
//     : forceUnlockDonations
//     ? favorRepRequired
//     : Math.min(highestRepAug, favorRepRequired);
//   if (highestRepAug == -1 && !forceUnlock && !forceRep)
//     return ns.print(`All "${factionName}" augmentations are owned. Skipping unlocking faction...`);
//   // Ensure we get an invite to location-based factions we might want / need
//   if (!(await earnFactionInvite(ns, factionName)))
//     return ns.print(`We are not yet part of faction "${factionName}". Skipping working for faction...`);
//   if (startingFavor >= repToDonate && !forceRep)
//     // If we have already unlocked donations via favour - no need to grind for rep
//     return ns.print(
//       `Donations already unlocked for "${factionName}". You should buy access to augs. Skipping working for faction...`
//     );
//   // Cannot work for gang factions. Detect if this is our gang faction!
//   if (factionName === playerGang || allGangFactions.includes(factionName))
//     return ns.print(`"${factionName}" is an active gang faction. Cannot work for gang factions...`);
//   if (forceUnlockDonations && mostExpensiveAugByFaction[factionName] < 0.2 * factionRepRequired) {
//     // Special check to avoid pointless donation unlocking
//     ns.print(
//       `The last "${factionName}" aug is only ${mostExpensiveAugByFaction[factionName].toLocaleString()} rep, ` +
//         `not worth grinding ${favorRepRequired.toLocaleString()} rep to unlock donations.`
//     );
//     forceUnlockDonations = false;
//     factionRepRequired = highestRepAug = mostExpensiveAugByFaction[factionName];
//   }

//   if (ns.getPlayer().workRepGained > 0)
//     // If we're currently doing faction work, stop to collect reputation and find out how much is remaining
//     await getNsDataThroughFile(ns, `ns.stopAction()`, '/Temp/stop-action.txt');
//   let currentReputation = ns.getFactionRep(factionName);
//   // If the best faction aug is within 10% of our current rep, grind all the way to it so we can get it immediately, regardless of our current rep target
//   if (forceBestAug || highestRepAug <= 1.1 * Math.max(currentReputation, factionRepRequired)) {
//     forceBestAug = true;
//     factionRepRequired = Math.max(highestRepAug, factionRepRequired);
//   }

//   if (currentReputation >= factionRepRequired)
//     return ns.print(
//       `Faction "${factionName}" required rep of ${Math.round(
//         factionRepRequired
//       ).toLocaleString()} has already been attained ` +
//         `(Current rep: ${Math.round(currentReputation).toLocaleString()}). Skipping working for faction...`
//     );

//   ns.print(
//     `Faction "${factionName}" Highest Aug Req: ${highestRepAug?.toLocaleString()}, Current Favor (` +
//       `${startingFavor?.toFixed(2)}/${repToDonate?.toFixed(2)}) Req: ${Math.round(favorRepRequired).toLocaleString()}`
//   );
//   if (options['invites-only']) return ns.print(`--invites-only Skipping working for faction...`);
//   if (prioritizeInvites && !forceUnlockDonations && !forceBestAug && !forceRep)
//     return ns.print(`--prioritize-invites Skipping working for faction for now...`);

//   let lastStatusUpdateTime = 0,
//     lastRepMeasurement = ns.getFactionRep(factionName),
//     repGainRatePerMs = 0;
//   while ((currentReputation = ns.getFactionRep(factionName)) < factionRepRequired) {
//     const factionWork = await detectBestFactionWork(ns, factionName); // Before each loop - determine what work gives the most rep/second for our current stats
//     if (
//       await getNsDataThroughFile(
//         ns,
//         `ns.workForFaction('${factionName}', '${factionWork}',  ${config('factions.shouldFocusAtWork')})`,
//         '/Temp/work-for-faction.txt'
//       )
//     ) {
//       if (config('factions.shouldFocusAtWork')) ns.tail(); // Force a tail window open to help the user kill this script if they accidentally closed the tail window and don't want to keep stealing focus
//       currentReputation = ns.getFactionRep(factionName); // Update to capture the reputation earned when restarting work
//       if (currentReputation > factionRepRequired) break;
//       lastActionRestart = Date.now();
//       repGainRatePerMs = ns.getPlayer().workRepGainRate; // Note: In order to get an accurate rep gain rate, we must wait for the first game tick (200ms) after starting work
//       while (repGainRatePerMs === ns.getPlayer().workRepGainRate && Date.now() - lastActionRestart < 400)
//         await ns.sleep(1); // TODO: Remove this if/when the game bug is fixed
//       repGainRatePerMs =
//         (ns.getPlayer().workRepGainRate / 200) *
//         (hasFocusPenaly && !config('factions.shouldFocusAtWork')
//           ? 0.8
//           : 1) /* penalty if we aren't focused but don't have the aug to compensate */;
//     } else {
//       announce(
//         ns,
//         `Something went wrong, failed to start "${factionWork}" work for faction "${factionName}" (Is gang faction, or not joined?)`,
//         'error'
//       );
//       break;
//     }
//     let status = `Doing '${factionWork}' work for "${factionName}" until ${Math.round(
//       factionRepRequired
//     ).toLocaleString()} rep.`;
//     if (
//       lastFactionWorkStatus != status ||
//       Date.now() - lastStatusUpdateTime > config('factions.statusUpdateInterval')
//     ) {
//       // Actually measure how much reputation we've earned since our last update, to give a more accurate ETA including external sources of rep
//       let measuredRepGainRatePerMs =
//         (ns.getFactionRep(factionName) - lastRepMeasurement) / (Date.now() - lastStatusUpdateTime);
//       if (currentReputation > lastRepMeasurement + config('factions.statusUpdateInterval') * repGainRatePerMs * 2)
//         // Detect a sudden increase in rep, but don't use it to update the expected rate
//         ns.print('SUCCESS: Reputation spike! (Perhaps a coding contract was just solved?) ETA reduced.');
//       else if (
//         lastStatusUpdateTime != 0 &&
//         Math.abs(measuredRepGainRatePerMs - repGainRatePerMs) / repGainRatePerMs > 0.05
//       )
//         // Stick to the game-provided rate if we measured something within 5% of that number
//         repGainRatePerMs = measuredRepGainRatePerMs; // If we measure a significantly different rep gain rate, this could be due to external sources of rep (e.g. sleeves) - account for it in the ETA
//       lastStatusUpdateTime = Date.now();
//       lastRepMeasurement = currentReputation;
//       const eta_milliseconds = (factionRepRequired - currentReputation) / repGainRatePerMs;
//       ns.print(
//         (lastFactionWorkStatus = status) +
//           ` Currently at ${Math.round(currentReputation).toLocaleString()}, earning ${formatNumberShort(
//             repGainRatePerMs * 1000
//           )} rep/sec. ` +
//           (config('factions.hasFocusPenaly') && !config('factions.shouldFocusAtWork')
//             ? 'after 20% non-focus Penalty '
//             : '') +
//           `(ETA: ${formatDuration(eta_milliseconds)})`
//       );
//     }
//     await tryBuyReputation(ns, options);
//     await ns.sleep(config('factions.restartWorkInteval'));
//     if (!forceBestAug && !forceRep) {
//       // Detect our rep requirement decreasing (e.g. if we exported for our daily +1 faction rep)
//       let currentFavor = await getCurrentFactionFavour(ns, factionName);
//       if (currentFavor > startingFavor) {
//         startingFavor = dictFactionFavors[factionName] = currentFavor;
//         favorRepRequired = Math.max(0, repToFavour(config('factions.repToDonate')) - repToFavour(startingFavor));
//         factionRepRequired = forceUnlockDonations ? favorRepRequired : Math.min(highestRepAug, favorRepRequired);
//       }
//     }
//     config('factions.');
//     let workRepGained = ns.getPlayer().workRepGained; // Try to align ourselves to the next game tick so we aren't missing out on a few ms of rep
//     while (workRepGained === ns.getPlayer().workRepGainRate && Date.now() - config('factions.lastActionRestart') < 200)
//       await ns.sleep(1);
//     // If we explicitly stop working, we immediately get our updated faction rep, otherwise it lags by 1 loop (until after next time we call workForFaction)
//     if (currentReputation + ns.getPlayer().workRepGained >= factionRepRequired) await ns.stopAction(); // We're close - stop working so our current rep is accurate when we check the while loop condition
//   }
//   if (currentReputation >= factionRepRequired)
//     ns.print(
//       `Attained ${Math.round(
//         currentReputation
//       ).toLocaleString()} rep with "${factionName}" (needed ${factionRepRequired.toLocaleString()}).`
//     );
//   return currentReputation >= factionRepRequired;
// }

// /** @param {NS} ns
//  * Try all work types and see what gives the best rep gain with this faction! */
// async function detectBestFactionWork(ns: NS, factionName: string, shouldFocusAtWork: boolean) {
//   let bestWorkType: string = '';
//   let bestRepRate = 0;
//   for (const workType of ['security', 'field', 'hacking']) {
//     if (ns.workForFaction(factionName, workType)) {
//       continue;
//     }
//     const currentRepGainRate = ns.getPlayer().workRepGainRate;
//     if (currentRepGainRate > bestRepRate) {
//       bestRepRate = currentRepGainRate;
//       bestWorkType = workType;
//     }
//   }
//   return bestWorkType;
// }

// export async function workForAllMegacorps(
//   ns: NS,
//   megacorpFactionsInPreferredOrder: string[],
//   alsoWorkForCompanyFactions: boolean,
//   oneCompanyFactionAtATime: boolean,
//   options: any
// ) {
//   let player = ns.getPlayer();
//   if (player.hacking < 225)
//     return ns.print(`Hacking Skill ${player.hacking} is to low to work for any megacorps (min req. 225).`);
//   let joinedCompanyFactions = player.factions.filter((f) => megacorpFactionsInPreferredOrder.includes(f)); // Company factions we've already joined
//   if (joinedCompanyFactions.length > 0)
//     ns.print(
//       `${joinedCompanyFactions.length} companies' factions have already been joined: ${joinedCompanyFactions.join(
//         ', '
//       )}`
//     );
//   let doFactionWork = alsoWorkForCompanyFactions && oneCompanyFactionAtATime;
//   // Earn each obtainabl megacorp faction invite, and optionally also grind faction rep
//   for (const factionName of megacorpFactionsInPreferredOrder) {
//     if ((await workForMegacorpFactionInvite(ns, factionName, doFactionWork, options)) && doFactionWork)
//       await workForSingleFaction(ns, factionName, options);
//   }
//   if (alsoWorkForCompanyFactions && !oneCompanyFactionAtATime) {
//     // If configured, start grinding rep with company factions we've joined
//     ns.print(`Done working for companies, now working for all incomplete company factions...`);
//     for (const factionName of megacorpFactionsInPreferredOrder) await workForSingleFaction(ns, factionName, options);
//   }
// }

// /** If we're wealthy, hashes have relatively little monetary value, spend hacknet-node hashes on contracts to gain rep faster **/
// export async function tryBuyReputation(ns: NS, options: any) {
//   if (options['no-coding-contracts']) return;
//   if (ns.getPlayer().money > 100e9) {
//     // If we're wealthy, hashes have relatively little monetary value, spend hacknet-node hashes on contracts to gain rep faster
//     let spentHashes =
//       ns.hacknet.numHashes() + (ns.hacknet.spendHashes('Generate Coding Contract') ? -ns.hacknet.numHashes() : 0);
//     if (spentHashes > 0) {
//       announce(
//         ns,
//         `Generated a new coding contract for ${formatNumberShort(Math.round(spentHashes / 100) * 100)} hashes`,
//         'success'
//       );
//     }
//   }
// }

// export async function workForMegacorpFactionInvite(ns: NS, factionName: string, waitForInvite: boolean, options: any) {
//   const companyConfig = config('factions.config.company').find((c) => c.name == factionName); // For anything company-specific
//   const companyName = companyConfig?.companyName || factionName; // Name of the company that gives the faction (same for all but Fulcrum)
//   const statModifier = companyConfig?.statModifier || 0; // How much e.g. Hack / Cha is needed for a promotion above the base requirement for the job
//   const repRequiredForFaction = companyConfig?.repRequiredForFaction || 200000; // Required to unlock the faction

//   let player = ns.getPlayer();
//   if (player.factions.includes(factionName)) return false; // Only return true if we did work to earn a new faction invite
//   if (ns.checkFactionInvitations().includes(factionName))
//     return waitForInvite ? await waitForFactionInvite(ns, factionName) : false;
//   // TODO: In some scenarios, the best career path may require combat stats, this hard-codes the optimal path for hack stats
//   const itJob = config('factions.jobs').find((j) => j.name == 'it');
//   const softwareJob = config('factions.jobs').find((j) => j.name == 'software');
//   if (itJob.reqHack[0] + statModifier > player.hacking)
//     // We don't qualify to work for this company yet if we can't meet IT qualifications (lowest there are)
//     return ns.print(
//       `Cannot yet work for "${companyName}": Need Hack ${itJob.reqHack[0] + statModifier} to get hired (current Hack: ${
//         player.hacking
//       });`
//     );
//   ns.print(`Going to work for Company "${companyName}" next...`);
//   let currentReputation,
//     currentRole = '',
//     currentJobTier = -1; // TODO: Derive our current position and promotion index based on player.jobs[companyName]
//   let lastStatus = '',
//     lastStatusUpdateTime = 0,
//     lastRepMeasurement = ns.getCompanyRep(companyName),
//     repGainRatePerMs = 0;
//   let studying = false,
//     working = false,
//     backdoored = false;
//   while (
//     (currentReputation = ns.getCompanyRep(companyName)) < repRequiredForFaction &&
//     !player.factions.includes(factionName)
//   ) {
//     player = ns.getPlayer();
//     // Determine the next promotion we're striving for (the sooner we get promoted, the faster we can earn company rep)
//     const getTier = (job) =>
//       Math.min(
//         job.reqRep.filter((r) => r <= currentReputation).length,
//         job.reqHack.filter((h) => h <= player.hacking).length,
//         job.reqCha.filter((c) => c <= player.charisma).length
//       ) - 1;
//     // It's generally best to hop back-and-forth between it and software engineer career paths (rep gain is about the same, but better money from software)
//     const qualifyingItTier = getTier(itJob),
//       qualifyingSoftwareTier = getTier(softwareJob);
//     const bestJobTier = Math.max(qualifyingItTier, qualifyingSoftwareTier); // Go with whatever job promotes us higher
//     const bestRoleName = qualifyingItTier > qualifyingSoftwareTier ? 'it' : 'software'; // If tied for qualifying tier, go for software
//     if (currentJobTier < bestJobTier || currentRole != bestRoleName) {
//       // We are ready for a promotion, ask for one!
//       if (ns.applyToCompany(companyName, bestRoleName))
//         announce(ns, `Successfully applied to "${companyName}" for a '${bestRoleName}' Job or Promotion`, 'success');
//       else if (currentJobTier !== -1)
//         // Unless we just restarted "work-for-factions" and lost track of our current job, this is an error
//         announce(ns, `Application to "${companyName}" for a '${bestRoleName}' Job or Promotion failed.`, 'error');
//       currentJobTier = bestJobTier; // API to apply for a job immediately gives us the highest tier we qualify for
//       currentRole = bestRoleName;
//       player = ns.getPlayer();
//     }
//     const currentJob = player.jobs[companyName];
//     const nextJobTier = currentRole == 'it' ? currentJobTier : currentJobTier + 1;
//     const nextJobName = currentRole == 'it' || nextJobTier >= itJob.reqRep.length ? 'software' : 'it';
//     const nextJob = nextJobName == 'it' ? itJob : softwareJob;
//     const requiredHack = nextJob.reqHack[nextJobTier] === 0 ? 0 : nextJob.reqHack[nextJobTier] + statModifier; // Stat modifier only applies to non-zero reqs
//     const requiredCha = nextJob.reqCha[nextJobTier] === 0 ? 0 : nextJob.reqCha[nextJobTier] + statModifier; // Stat modifier only applies to non-zero reqs
//     const requiredRep = nextJob.reqRep[nextJobTier]; // No modifier on rep requirements
//     let status =
//       `Next promotion ('${nextJobName}' #${nextJobTier}) at Hack:${requiredHack} Cha:${requiredCha} Rep:${requiredRep?.toLocaleString()}` +
//       (repRequiredForFaction > nextJob.reqRep[nextJobTier]
//         ? ''
//         : `, but we won't need it, because we'll sooner hit ${repRequiredForFaction.toLocaleString()} reputation to unlock company faction "${factionName}"!`);
//     // We should only study at university if every other requirement is met but Charisma

//     if (
//       currentReputation >= requiredRep &&
//       player.hacking >= requiredHack &&
//       player.charisma < requiredCha &&
//       !config('factions.noStudying')
//     ) {
//       status = `Studying at ZB university until Cha reaches ${requiredCha}...\n` + status;
//       if (
//         studying &&
//         player.className !== 'taking a Leadership course' &&
//         player.className !== 'Leadership' /* In case className is made more intuitive in the future */
//       ) {
//         announce(
//           ns,
//           `Leadership studies were interrupted. player.className="${player.className}" Restarting in 5 seconds...`,
//           'warning'
//         );
//         studying = false; // If something external has interrupted our studies, take note
//         ns.tail(); // Force a tail window open to help the user kill this script if they accidentally closed the tail window and don't want to keep studying
//       }
//       if (!studying) {
//         // Study at ZB university if CHA is the limiter.
//         if (await studyForCharisma(ns)) working = !(studying = true);
//       }
//       if (requiredCha - player.charisma > 10) {
//         // Try to spend hacknet-node hashes on university upgrades while we've got a ways to study to make it go faster
//         let spentHashes =
//           ns.hacknet.numHashes() + (ns.hacknet.spendHashes('Improve Studying') ? -ns.hacknet.numHashes() : 0);
//         if (spentHashes > 0) {
//           announce(ns, 'Bought a "Improve Studying" upgrade.', 'success');
//           await studyForCharisma(ns); // We must restart studying for the upgrade to take effect.
//         }
//       }
//     } else if (studying) {
//       // If we no longer need to study and we currently are, turn off study mode and get back to work!
//       studying = false;
//       continue; // Restart the loop so we refresh our promotion index and apply for a promotion before working more
//     }
//     await tryBuyReputation(ns, options);

//     // Regardless of the earlier promotion logic, always try for a promotion to make sure we don't miss a promotion due to buggy logic
//     if (ns.applyToCompany(companyName, currentRole))
//       announce(
//         ns,
//         `Unexpected '${currentRole}' promotion from ${currentJob} to "${
//           ns.getPlayer().jobs[companyName]
//         }. Promotion logic must be off..."`,
//         'warning'
//       );

//     // TODO: If we ever get rid of the below periodic restart-work, we will need to monitor for interruptions with player.workType == e.g. "Work for Company"
//     if (
//       !studying &&
//       (!working ||
//         Date.now() - config('factions.lastActionRestart') >=
//           config('factions.restartWorkInteval')) /* We must periodically restart work to collect Rep Gains */
//     ) {
//       // Work for the company (assume daemon is grinding hack XP as fast as it can, so no point in studying for that)
//       if (ns.workForCompany('${companyName}')) {
//         working = true;
//         if (config('factions.shouldFocusAtWork')) ns.tail(); // Force a tail window open to help the user kill this script if they accidentally closed the tail window and don't want to keep stealing focus
//         currentReputation = ns.getCompanyRep(companyName); // Update to capture the reputation earned when restarting work
//         let lastActionRestart = Date.now();
//         repGainRatePerMs = ns.getPlayer().workRepGainRate; // Note: In order to get an accurate rep gain rate, we must wait for the first game tick (200ms) after starting work
//         while (repGainRatePerMs === ns.getPlayer().workRepGainRate && Date.now() - lastActionRestart < 400)
//           await ns.sleep(1); // TODO: Remove this if/when the game bug is fixed
//         repGainRatePerMs =
//           (ns.getPlayer().workRepGainRate / 200) *
//           (config('factions.hasFocusPenaly') && !config('factions.shouldFocusAtWork')
//             ? 0.8
//             : 1) /* penalty if we aren't focused but don't have the aug to compensate */;
//       } else {
//         announce(ns, `Something went wrong, failed to start working for company "${companyName}".`, 'error');
//         break;
//       }
//     }
//     if (lastStatus != status || Date.now() - lastStatusUpdateTime > config('factions.statusUpdateInterval')) {
//       if (!backdoored)
//         // Check if an external script has backdoored this company's server yet. If so, it affects our ETA. (Don't need to check again once we discover it is)
//         backdoored = ns.getServer(config('factions.server_by_company')[companyName]).backdoorInstalled;
//       const cancellationMult = backdoored ? 0.75 : 0.5; // We will lose some of our gained reputation when we stop working early
//       repGainRatePerMs *= cancellationMult;
//       // Actually measure how much reputation we've earned since our last update, to give a more accurate ETA including external sources of rep
//       let measuredRepGainRatePerMs =
//         (ns.getCompanyRep(companyName) - lastRepMeasurement) / (Date.now() - lastStatusUpdateTime);
//       if (currentReputation > lastRepMeasurement + config('factions.statusUpdateInterval') * repGainRatePerMs * 2)
//         // Detect a sudden increase in rep, but don't use it to update the expected rate
//         ns.print('SUCCESS: Reputation spike! (Perhaps a coding contract was just solved?) ETA reduced.');
//       else if (
//         lastStatusUpdateTime != 0 &&
//         Math.abs(measuredRepGainRatePerMs - repGainRatePerMs) / repGainRatePerMs > 0.05
//       )
//         // Stick to the game-provided rate if we measured something within 5% of that number
//         repGainRatePerMs = measuredRepGainRatePerMs; // If we measure a significantly different rep gain rate, this could be due to external sources of rep (e.g. sleeves) - account for it in the ETA
//       lastStatusUpdateTime = Date.now();
//       lastRepMeasurement = currentReputation;
//       const eta_milliseconds = ((requiredRep || repRequiredForFaction) - currentReputation) / repGainRatePerMs;
//       player = ns.getPlayer();
//       ns.print(
//         `Currently a "${
//           player.jobs[companyName]
//         }" ('${currentRole}' #${currentJobTier}) for "${companyName}" earning ${formatNumberShort(
//           repGainRatePerMs * 1000
//         )} rep/sec. ` +
//           `(after ${(100 * (1 - cancellationMult))?.toFixed(0)}% early-quit penalty` +
//           (config('factions.hasFocusPenaly') && !config('factions.shouldFocusAtWork')
//             ? ' and 20% non-focus Penalty'
//             : '') +
//           `)\n` +
//           `${status}\nCurrent player stats are Hack:${player.hacking} ${
//             player.hacking >= (requiredHack || 0) ? '✓' : '✗'
//           } ` +
//           `Cha:${player.charisma} ${player.charisma >= (requiredCha || 0) ? '✓' : '✗'} ` +
//           `Rep:${Math.round(currentReputation).toLocaleString()} ${
//             currentReputation >= (requiredRep || repRequiredForFaction)
//               ? '✓'
//               : `✗ (ETA: ${formatDuration(eta_milliseconds)})`
//           }`
//       );
//       lastStatus = status;
//     }
//     await ns.sleep(config('factions.loopSleepInterval')); // Sleep now and wake up periodically and stop working to check our stats / reputation progress
//   }
//   // Return true if we succeeded, false otherwise.
//   if (currentReputation >= repRequiredForFaction) {
//     ns.print(`Attained ${repRequiredForFaction.toLocaleString()} rep with "${companyName}".`);
//     if (!player.factions.includes(factionName) && waitForInvite) return await waitForFactionInvite(ns, factionName);
//     return true;
//   }
//   ns.print(
//     `Stopped working for "${companyName}" repRequiredForFaction: ${repRequiredForFaction.toLocaleString()} ` +
//       `currentReputation: ${Math.round(currentReputation).toLocaleString()} inFaction: ${player.factions.includes(
//         factionName
//       )}`
//   );
//   return false;
// }
