export const mafia = {
  /** How to Pace the primary loop */
  updateInterval: 200,

  /** Maximum number of members */
  maxMembers: 12,

  /** How much of our respoct to spend on recruitment */
  percentOfRespectToSpendOnRecruitment: 0.75,

  thresholds: {
    wanted_penalty: 0.0001,
    war_engagement: 0.65,
    ascend: 1.05,
  },

  ascension: {
    increment: 0.05,
  },

  war: {
    active_gangs: 0,
    win_chance: {
      lowest: 1,
      average: 0,
      total: 0,
      lowest_gang: '',
    },
  },
  equipment: {
    weapons: [
      'Baseball Bat',
      'Katana',
      'Glock 18C',
      'P90C',
      'Steyr AUG',
      'AK-47',
      'M15A10 Assault Rifle',
      'AWM Sniper Rifle',
    ],
    armor: ['Bulletproof Vest', 'Full Body Armor', 'Liquid Body Armor', 'Graphene Plating Armor'],
    vehicle: ['Ford Flex V20', 'ATX1070 Superbike', 'Mercedes-Benz S9001', 'White Ferrari'],
    rootkit: ['NUKE Rootkit', 'Soulstealer Rootkit', 'Demon Rootkit', 'Hmap Node', 'Jack the Ripper'],
    augmentation: [
      'Bionic Arms',
      'Bionic Legs',
      'Bionic Spine',
      'BrachiBlades',
      'Nanofiber Weave',
      'Synthetic Heart',
      'Synfibril Muscle',
      'BitWire',
      'Neuralstimulator',
      'DataJack',
      'Graphene Bone Lacings',
    ],
  },
};
