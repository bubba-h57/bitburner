export const factions = {
  servers: [
    'CSEC',
    'I.I.I.I',
    'avmnite-02h',
    'run4theh111z',
    'clarkinc',
    'nwo',
    'omnitek',
    'fulcrumtech',
    'fulcrumassets',
    'w0r1d_d43m0n',
  ],

  // Used when working for a company to see if their server has been backdoored. If so, we can expect an increase in
  // rep-gain (used for predicting an ETA)
  server_by_company: {
    'Bachman & Associates': 'b-and-a',
    ECorp: 'ecorp',
    'Clarke Incorporated': 'clarkinc',
    'OmniTek Incorporated': 'omnitek',
    NWO: 'nwo',
    'Blade Industries': 'blade',
    MegaCorp: 'megacorp',
    'KuaiGong International': 'kuai-gong',
    'Fulcrum Technologies': 'fulcrumtech',
    'Four Sigma': '4sigma',
  },

  order: {
    preferred: {
      early_faction: [
        // Unlock Gangs
        'Slum Snakes',
        // Required to set up hash income
        'Netburners',
        'Tian Di Hui',
        // These give all the company_rep and faction_rep bonuses early game
        'Aevum',
        'CyberSec',
        /* Quick, and NightSec aug depends on an aug from here */
        'NiteSec',
        // Cha augs to speed up earning company promotions
        'Tetrads',
        // Boost company/faction rep for future augs
        'Bachman & Associates',
        // Once we have all faction_rep boosting augs, there's no reason not to work towards Daedalus as soon as it's available/feasible so we can buy Red Pill
        'Daedalus',
        // Will be removed if hack level is too low to backdoor their server
        'Fulcrum Secret Technologies',
        // More cmp_rep augs, and some strong hack ones as well
        'ECorp',
        'BitRunners',
        // Fastest sources of hacking augs after the above companies
        'The Black Hand',
        // Unique cmp_rep aug TODO: Can it sensibly be gotten before corps? Requires 300 all combat stats
        'The Dark Army',
        'Clarke Incorporated',
        'OmniTek Incorporated',
        // More hack augs from companies
        'NWO',
        // Unique Source of big 1.4x hack exp boost (Can only join if not in e.g. Aevum as well)
        'Chongqing',
      ],
      company_faction: [
        // Augs boost company_rep by 1.65, faction_rep by 1.50. Lower rep-requirements than ECorp augs, so should be a priority to speed up future resets
        'Bachman & Associates',
        // Offers 2.26 multi worth of company_rep and major hacking stat boosts (1.51 hack / 1.54 exp / 1.43 success / 3.0 grow / 2.8 money / 1.25 speed), but high rep reqs
        'ECorp',
        // Biggest boost to hacking after above factions (1.38)
        'Clarke Incorporated',
        // Next big boost to hacking after above factions (1.20) (NWO is bigger, but this has lower Cha reqs.)
        'OmniTek Incorporated',
        // Biggest boost to hacking after above factions (1.26)
        'NWO',
        // Mostly redundant after Ecorp - provides remaining hack-related augs (1.10 money, 1.03 speed)
        'Blade Industries',
        // Offers 1 unique aug boosting all physical traits by 1.35
        'MegaCorp',
        // 1.40 to agility, defense, strength
        'KuaiGong International',
        // Big boosts to company_rep and hacking, but requires high hack level to backdoor their server, so might have to be left until later// Big boosts to company_rep and hacking, but requires high hack level to backdoor their server, so might have to be left until later
        'Fulcrum Secret Technologies',
        // No unique augs, but note that if accessible early on, Fulcrum + Four Sigma is a one-two punch to get all company rep boosting augs in just 2 factions
        'Four Sigma',
      ],
      crime_faction: [
        'Netburners',
        'Slum Snakes',
        'NiteSec',
        'Tetrads',
        'The Black Hand',
        'The Syndicate',
        'The Dark Army',
        'Speakers for the Dead',
        'Daedalus',
      ],
    },
  },

  config: {
    company: [
      { name: 'NWO', statModifier: 25 },
      { name: 'MegaCorp', statModifier: 25 },
      { name: 'Blade Industries', statModifier: 25 },
      { name: 'Fulcrum Secret Technologies', companyName: 'Fulcrum Technologies', repRequiredForFaction: 250000 },
      {
        name: 'Silhouette',
        companyName: 'TBD',
        /* Force work until max promotion. */
        repRequiredForFaction: 999e9,
      },
    ],
    faction: [{ name: 'Slum Snakes', forceUnlock: true }],
  },

  jobs: [
    // Job stat requirements for a company with a base stat modifier of +224
    // (modifier of all megacorps except the ones above which are 25 higher)
    {
      name: 'it',
      reqRep: [0, 7e3, 35e3, 175e3],
      reqHack: [225, 250, 275, 375],
      reqCha: [0, 0, 275, 300],
      repMult: [0.9, 1.1, 1.3, 1.4],
    },
    {
      name: 'software',
      reqRep: [0, 8e3, 40e3, 200e3, 400e3, 800e3, 1.6e6, 3.2e6],
      reqHack: [225, 275, 475, 625, 725, 725, 825, 975],
      reqCha: [0, 0, 275, 375, 475, 475, 625, 725],
      repMult: [0.9, 1.1, 1.3, 1.5, 1.6, 1.6, 1.75, 2],
    },
  ],

  list: [
    'Illuminati',
    'Daedalus',
    'The Covenant',
    'ECorp',
    'MegaCorp',
    'Bachman & Associates',
    'Blade Industries',
    'NWO',
    'Clarke Incorporated',
    'OmniTek Incorporated',
    'Four Sigma',
    'KuaiGong International',
    'Fulcrum Secret Technologies',
    'BitRunners',
    'The Black Hand',
    'NiteSec',
    'Aevum',
    'Chongqing',
    'Ishima',
    'New Tokyo',
    'Sector-12',
    'Volhaven',
    'Speakers for the Dead',
    'The Dark Army',
    'The Syndicate',
    'Silhouette',
    'Tetrads',
    'Slum Snakes',
    'Netburners',
    'Tian Di Hui',
    'CyberSec',
  ],

  loopSleepInterval: 5000, // 5 seconds
  statusUpdateInterval: 60000, // 1 minute (outside of this, minor updates in e.g. stats aren't logged)
  restartWorkInteval: 30000, // Collect e.g. rep earned by stopping and starting work,
  noFocus: false, // Can be set via command line to disable doing work that requires focusing (crime, studying, or focused faction/company work)
  noStudying: false, // Disable studying for Charisma. Useful in longer resets when Cha augs are insufficient to meet promotion requirements (Also disabled with --no-focus)
  noCrime: false, // Disable doing crimes at all. (Also disabled with --no-focus)
  crimeFocus: false, // Useful in crime-focused BNs when you want to focus on crime related factions
  fastCrimesOnly: false, // Can be set via command line argument
  prioritizeInvites: false,
  hasFocusPenaly: true,
  shouldFocusAtWork: false, // Whether we should focus on work or it be backgrounded (based on whether "Neuroreceptor Management Implant" is owned, or "--no-focus" is specified)
  repToDonate: 150, // Updated after looking at bitnode mults
  lastActionRestart: 0,
  crimeCount: 0, // A simple count of crime commited since last script restart
  ownedAugmentations: [],
  mostExpensiveAugByFaction: [],
  mostExpensiveDesiredAugByFaction: [],
  playerGang: null,
  allGangFactions: [],

  arguments: {
    schema: [
      ['first', []], // Grind rep with these factions first. Also forces a join of this faction if we normally wouldn't (e.g. no desired augs or all augs owned)
      ['skip', []], // Don't work for these factions
      ['o', false], // Immediately grind company factions for rep after getting their invite, rather than first getting all company invites we can
      ['desired-stats', ['hacking', 'faction_rep', 'company_rep', 'charisma', 'hacknet']], // Factions will be removed from our 'early-faction-order' once all augs with these stats have been bought out
      ['no-focus', false], // Disable doing work that requires focusing (crime, studying, or focused faction/company work)
      ['no-studying', false], // Disable studying for Charisma. Useful in longer resets when Cha augs are insufficient to meet promotion requirements (Also disabled with --no-focus)
      ['no-coding-contracts', false], // Disable purchasing coding contracts for reputation
      ['no-crime', false], // Disable doing crimes at all. (Also disabled with --no-focus)
      ['crime-focus', false], // Useful in crime-focused BNs when you want to focus on crime related factions
      ['fast-crimes-only', false], // Assasination and Heist are so slow, I can see people wanting to disable them just so they can interrupt at will.
      ['invites-only', false], // Just work to get invites, don't work for augmentations / faction rep
      ['prioritize-invites', false], // Prioritize working for as many invites as is practical before starting to grind for faction reputation
    ],
  },
};
