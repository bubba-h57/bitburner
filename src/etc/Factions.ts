export const factions = {
  servers: {
    backdoor: [
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
    company: {
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
  },

  config: {
    company: [
      { name: 'NWO', jobStatModifier: 25 },
      { name: 'MegaCorp', jobStatModifier: 25 },
      { name: 'Blade Industries', jobStatModifier: 25 },
      { name: 'Fulcrum Secret Technologies', companyName: 'Fulcrum Technologies', repRequiredForFaction: 250000 },
      {
        name: 'Silhouette',
        companyName: 'TBD',
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

  share_script: '/bin/hack/share.js',
};
