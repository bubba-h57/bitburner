import { NS } from 'Bitburner';
import { Skill } from '/lib/Skill';

export function BladeBurnerSkills(ns: NS): Skill[] {
  return [
    {
      api: 'Hyperdrive',
      name: 'Hyperdrive',
      level: ns.bladeburner.getSkillLevel('Hyperdrive'),
      cost: ns.bladeburner.getSkillUpgradeCost('Hyperdrive'),
      priority: 0,
      targetLevel: 20,
    },
    {
      api: 'Overclock',
      name: 'Overclock',
      level: ns.bladeburner.getSkillLevel('Overclock'),
      cost: ns.bladeburner.getSkillUpgradeCost('Overclock'),
      priority: 1,
      targetLevel: 99,
    },
    {
      api: 'HandsOfMidas',
      name: 'Hands of Midas',
      level: ns.bladeburner.getSkillLevel('Hands of Midas'),
      cost: ns.bladeburner.getSkillUpgradeCost('Hands of Midas'),
      priority: 3,
      targetLevel: 50,
    },
    {
      api: 'CybersEdge',
      name: "Cyber's Edge",
      level: ns.bladeburner.getSkillLevel("Cyber's Edge"),
      cost: ns.bladeburner.getSkillUpgradeCost("Cyber's Edge"),
      priority: 4,
      targetLevel: 40,
    },
    {
      api: 'BladesIntuition',
      name: "Blade's Intuition",
      level: ns.bladeburner.getSkillLevel("Blade's Intuition"),
      cost: ns.bladeburner.getSkillUpgradeCost("Blade's Intuition"),
      priority: 5,
      targetLevel: 40,
    },
    {
      api: 'Cloak',
      name: 'Cloak',
      level: ns.bladeburner.getSkillLevel('Cloak'),
      cost: ns.bladeburner.getSkillUpgradeCost('Cloak'),
      priority: 6,
      targetLevel: 40,
    },
    {
      api: 'ShortCircuit',
      name: 'Short-Circuit',
      level: ns.bladeburner.getSkillLevel('Short-Circuit'),
      cost: ns.bladeburner.getSkillUpgradeCost('Short-Circuit'),
      priority: 7,
      targetLevel: 40,
    },
    {
      api: 'Reaper',
      name: 'Reaper',
      level: ns.bladeburner.getSkillLevel('Reaper'),
      cost: ns.bladeburner.getSkillUpgradeCost('Reaper'),
      priority: 8,
      targetLevel: 40,
    },
    {
      api: 'Datamancer',
      name: 'Datamancer',
      level: ns.bladeburner.getSkillLevel('Datamancer'),
      cost: ns.bladeburner.getSkillUpgradeCost('Datamancer'),
      priority: 9,
      targetLevel: 40,
    },
    {
      api: 'EvasiveSystem',
      name: 'Evasive System',
      level: ns.bladeburner.getSkillLevel('Evasive System'),
      cost: ns.bladeburner.getSkillUpgradeCost('Evasive System'),
      priority: 10,
      targetLevel: 40,
    },
    {
      api: 'Tracer',
      name: 'Tracer',
      level: ns.bladeburner.getSkillLevel('Tracer'),
      cost: ns.bladeburner.getSkillUpgradeCost('Tracer'),
      priority: 11,
      targetLevel: 40,
    },
    {
      api: 'DigitalObserver',
      name: 'Digital Observer',
      level: ns.bladeburner.getSkillLevel('Digital Observer'),
      cost: ns.bladeburner.getSkillUpgradeCost('Digital Observer'),
      priority: 12,
      targetLevel: 40,
    },
  ];
}
