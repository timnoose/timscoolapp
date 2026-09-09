/**
 * ============================================================
 *  PERSONALIZATION — edit this file to re-skin the whole game.
 * ============================================================
 * Names, title, sayings and a few tone knobs live here.
 * Dialogue text lives in src/data/dialogue.ts (uses these names).
 * Balance numbers live in src/data/balance.ts.
 */
export const PERSONAL = {
  gameTitle: 'He-Erik-Man Quest',
  gameSubtitle: 'Building Edition',
  version: '1.0.0',

  // The hero
  heroName: 'Erik',            // short name used in dialogue
  heroTitle: 'Pastor Erik',    // how NPCs address him
  heroNickname: 'He-Erik-Man', // wrestling / hero name
  heroPronoun: { subj: 'he', obj: 'him', pos: 'his' },

  // The church
  churchName: 'Harvest Ft. Campbell',
  churchShort: 'Harvest',
  townName: 'Clarksville',
  stateName: 'Tennessee',
  currentBuildingName: 'The Warehouse',

  // The gift-giver / advisor (the "Wise Sage")
  sageName: 'Wise Sage Tim',
  sageShort: 'Tim',

  // Signature sayings (used in dialogue, HUD flavor, and encounter banter)
  sayings: {
    bestChurch: "I'm not saying we are the best church in the area but... c'mon.",
    wwjd: 'Hmmm... what would Jesus do? What would He-Man do?',
    violence: "I'm not usually an advocate for violence, but...",
    ledWall: "How cool would an LED wall be? I mean... c'mon.",
    bench300: "To be an elder in this church, if they can't bench 300, I may have questions.",
  },

  // Fun details
  favoriteTeam: 'Gamecocks',
  favoriteTeamColor: 0x73000a,
  coffeeOrder: 'black coffee, the size of a fire extinguisher',
  wrestlingEventName: 'HARVEST SLAM',
  trailerText: 'BLOCK PARTY!',

  // Real-church Easter eggs (from the church website)
  churchFullName: 'Harvest Church Ft. Campbell',
  formerName: 'Real Life Ft. Campbell',
  sendingChurch: 'Real Life Sango',
  mission: 'Love Jesus. Love People. Make Disciples. Plant Churches.',
  address: '199 Jack Miller Blvd',
  phone: '(931) 431-5013',
  serviceTime: 'Sundays 10:30 AM',
  youthMinistry: 'Impact Student Ministry',
  youthNight: 'Wednesdays at 6',
  kidsClasses: ['Harvest Babees', 'Harvest Tots', 'Harvest Little Kids', 'Harvest Big Kids'],
  groupsName: 'C-Groups',
  armyPost: 'Fort Campbell',

  // Public bio Easter eggs (set any to '' to remove it from the game)
  bio: {
    lastName: 'Maloy',
    formerLife: 'US Navy submariner and MMA fighter',
    podcast: true,
    hometownRegion: 'Boston',
    formerChurch: 'First Church in Charlestown',
    formerJob: 'public school teacher',
    family: 'Sarah, Casey and Kayla', // shown on the office desk photo; leave '' to skip
  },

  // Erik's "fake cursing": symbol strings only, never a real word
  fakeCurses: ['@#$%&!', '#@%$*!!', '$%&@#!', '%$#@&*!', '@$#!!', '&%$#@?!', '#$@%!!', '$#!@&%!'],
  curseCorrections: [
    '...I said "sugar." Sugar.',
    '...that was "fiddlesticks." Ask anyone.',
    '...in the original Greek that means "oh no."',
    '...I meant "dagnabbit." I am a pastor.',
    '...that\'s Hebrew for "hmm."',
    '...bless it. BLESS it.',
  ],

  // Endings
  historicChurchName: 'Old Madison Street Chapel',
  newBuildName: 'Harvest Campus',
};

export type Personal = typeof PERSONAL;
