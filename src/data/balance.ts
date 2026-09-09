/**
 * Balance knobs. Tweak difficulty here.
 * Money is in dollars. Goodwill/morale/energy are 0-100.
 */
export const BALANCE = {
  startFund: 6000,
  startGoodwill: 35,
  startMorale: 55,
  maxEnergy: 100,

  // Recovery loop
  sundayEnergyCost: 35,          // preaching costs energy
  sundayBaseOffering: 1400,      // + morale bonus
  sundayMoralePerDollar: 22,     // offering += morale * this
  sundayMoraleGain: 3,           // a good service lifts morale a little
  coffeeRefillEnergy: 25,        // church coffee station, once per day
  restEnergy: 100,               // rest restores fully

  // Random events
  eventCooldownDays: 2,
  eventChance: 0.55,

  // Encounter costs
  moveEnergyCost: { listen: 4, vision: 10, coffee: 0, volunteer: 8, boundary: 12, sage: 6, meeting: 14 },
  encounterLossMorale: 4,

  // Endings
  buyCost: 48000,
  buildCost: 36000,
  buildGoodwillNeeded: 60,   // the city + neighbors have to like you
  buyMoraleNeeded: 55,        // the congregation has to be in

  // Quest costs / rewards
  hvacFullRepair: 4200,
  hvacVolunteerRepair: 900,
  hvacFansCost: 350,
  memorialRestore: 400,
  memorialGarden: 1800,
  wrestlingCost: 1200,
  wrestlingBaseRaise: 9000,
  grantAward: 12000,
  donorBig: 15000,
  donorFair: 10000,
};
