export const gyms = {
  locations: [
    { city: 'Aevum', gym: 'Snap Fitness Gym' },
    { city: 'Sector-12', gym: 'Powerhouse Gym' },
    { city: 'Volhaven', gym: 'Millenium Fitness Gym' },
  ],

  levels: {
    initial: {
      strength: 100,
      dexterity: 100,
      defense: 100,
      agility: 100,
    },
    advanced: {
      strength: 400,
      dexterity: 400,
      defense: 400,
      agility: 400,
    },
  },
  training: {
    interval: 60000,
  },
  statistics: ['strength', 'agility', 'defense', 'dexterity'],
};
