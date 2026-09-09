/**
 * All dialogue. Edit freely: this file is content, not engine.
 *
 * Format (see src/engine/script.ts):
 *   L('castId', 'text', 'mood')  -> a spoken line with portrait
 *   N('text')                     -> narrator line
 *   { choice: [...] }             -> menu of options
 *   { effects: [...] }            -> change resources/flags/quests
 *   { if: g => cond, then: 'id', else: 'id' }
 *   { encounter: 'id', win: 'id', lose: 'id' }
 *   { goto: 'id' } / { end: true }
 *
 * Text placeholders: {hero} {heroTitle} {nick} {church} {churchShort} {town} {sage} {sageShort}
 *                    {fund} {day} {event} {chapel} {campus} {team}
 */
import type { Dialogues, LineStep } from '../engine/script';
import type { Game } from '../engine/state';
import type { Mood } from '../art/portraits';
import { PERSONAL } from '../config/personal';
import { BALANCE } from './balance';
import { money } from '../engine/format';

const S = PERSONAL.sayings;
const L = (who: string, text: string, mood?: Mood): LineStep => ({ who, text, mood });
const N = (text: string): LineStep => ({ text });
const ME = (text: string, mood: Mood = 'neutral'): LineStep => ({ who: 'erik', text, mood });

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
/** A symbol-only "curse" that never spells a word, e.g. "@#$%&!" */
export function fakeCurse(): string { return pick(PERSONAL.fakeCurses); }
export function curseCorrection(): string { return pick(PERSONAL.curseCorrections); }

export function template(t: string, g: Game): string {
  const s = g.state;
  return t
    .replace(/\{curse\}/g, () => fakeCurse())
    .replace(/\{oops\}/g, () => curseCorrection())
    .replace(/\{mission\}/g, PERSONAL.mission)
    .replace(/\{address\}/g, PERSONAL.address)
    .replace(/\{phone\}/g, PERSONAL.phone)
    .replace(/\{serviceTime\}/g, PERSONAL.serviceTime)
    .replace(/\{formerName\}/g, PERSONAL.formerName)
    .replace(/\{sendingChurch\}/g, PERSONAL.sendingChurch)
    .replace(/\{youth\}/g, PERSONAL.youthMinistry)
    .replace(/\{youthNight\}/g, PERSONAL.youthNight)
    .replace(/\{post\}/g, PERSONAL.armyPost)
    .replace(/\{groups\}/g, PERSONAL.groupsName)
    .replace(/\{hero\}/g, PERSONAL.heroName)
    .replace(/\{heroTitle\}/g, PERSONAL.heroTitle)
    .replace(/\{nick\}/g, PERSONAL.heroNickname)
    .replace(/\{church\}/g, PERSONAL.churchName)
    .replace(/\{churchShort\}/g, PERSONAL.churchShort)
    .replace(/\{town\}/g, PERSONAL.townName)
    .replace(/\{sage\}/g, PERSONAL.sageName)
    .replace(/\{sageShort\}/g, PERSONAL.sageShort)
    .replace(/\{fund\}/g, money(s.fund))
    .replace(/\{goodwill\}/g, String(s.goodwill))
    .replace(/\{morale\}/g, String(s.morale))
    .replace(/\{day\}/g, String(s.day))
    .replace(/\{event\}/g, PERSONAL.wrestlingEventName)
    .replace(/\{chapel\}/g, PERSONAL.historicChurchName)
    .replace(/\{campus\}/g, PERSONAL.newBuildName)
    .replace(/\{team\}/g, PERSONAL.favoriteTeam);
}

// =====================================================================
// Which dialogue an NPC / object uses right now (ordered rules)
// =====================================================================
export const TALK: Record<string, (g: Game) => string> = {
  kyle: (g) => {
    if (g.questIs('hvac', 'inactive')) return 'kyle_hvac_start';
    if (g.questIs('hvac', 'active')) return g.questStage('hvac') >= 2 ? 'kyle_hvac_check' : 'kyle_hvac_hint';
    if (g.has('soundboardBroken')) return 'kyle_board_broken';
    if (g.has('eventPermit') && !g.has('eventDone')) return 'kyle_wrestling';
    if (g.questIs('elders', 'done')) return 'kyle_end';
    return 'kyle_idle';
  },
  brayden: (g) => (g.has('braydenHelped') ? 'brayden_after' : 'brayden'),
  tasha: (g) => {
    if (!g.has('tashaAsked')) return 'tasha_intro';
    if (g.has('tashaAsked') && !g.has('braydenHelped')) return 'tasha_waiting';
    return 'tasha_after';
  },
  doug: (g) => {
    if (g.questIs('elders', 'active')) {
      const st = g.questStage('elders');
      if (st === 0) return 'doug_phase1';
      if (st === 3) return 'elders_decide';
      return 'doug_wait';
    }
    if (g.questIs('elders', 'done')) return 'doug_end';
    return 'doug_idle';
  },
  marcus: (g) => {
    if (g.questIs('elders', 'active')) {
      const st = g.questStage('elders');
      if (st === 1) return 'marcus_phase2';
      if (st === 3) return 'elders_decide';
      return st === 0 ? 'marcus_wait' : 'marcus_wait2';
    }
    if (g.questIs('elders', 'done')) return 'marcus_end';
    return 'marcus_idle';
  },
  janet: (g) => {
    if (g.questIs('elders', 'active')) {
      const st = g.questStage('elders');
      if (st === 2) return 'janet_phase3';
      if (st === 3) return 'elders_decide';
      return 'janet_wait';
    }
    if (g.questIs('elders', 'done')) return 'janet_end';
    return 'janet_idle';
  },
  member2: () => 'member2',
  member1: () => 'member1',
  reyes: (g) => (g.has('reyesTalked') ? 'reyes_again' : 'reyes'),
  welcomeTable: () => 'welcomeTable',
  kidsBoard: () => 'kidsBoard',
  dale: (g) => {
    if (g.questIs('hvac', 'active') && g.questStage('hvac') === 0) return 'dale_meet';
    if (g.questIs('hvac', 'active') && g.questStage('hvac') === 1) return 'dale_options';
    if (g.questIs('hvac', 'active')) return 'dale_after';
    if (g.questIs('hvac', 'done')) return g.isAlly('dale') ? 'dale_ally' : 'dale_done';
    return 'dale_idle';
  },
  jess: () => 'jess',
  tim: (g) => {
    if (g.questIs('elders', 'done')) return 'tim_end';
    if (g.questIs('elders', 'active')) return 'tim_elders';
    if (g.questIs('campaign', 'active')) return 'tim_campaign';
    if (g.questIs('neighbor', 'active')) return 'tim_neighbor';
    if (g.questIs('memorial', 'active')) return 'tim_memorial';
    if (g.questIs('hvac', 'active')) return 'tim_hvac';
    if (!g.has('metTim')) return 'tim_first';
    return 'tim_idle';
  },
  whitlock: (g) => {
    if (g.has('donorDone')) return 'whitlock_done';
    if (g.questIs('campaign', 'active')) return 'whitlock_pitch';
    return 'whitlock_idle';
  },
  harold: (g) => {
    if (g.questIs('memorial', 'active') && g.questStage('memorial') === 1 && !g.has('haroldTalked')) return 'harold_confess';
    if (g.questIs('memorial', 'active') && g.questStage('memorial') === 1) return 'harold_wait';
    if (g.questIs('memorial', 'active')) return 'harold_wait';
    if (g.questIs('memorial', 'done')) return 'harold_done';
    return 'harold_idle';
  },
  haroldCity: () => 'harold_city',
  bev: (g) => {
    if (g.has('eventPermit')) return 'bev_done';
    if (g.questIs('campaign', 'active')) return 'bev_permit';
    if (g.questIs('elders', 'done')) return 'bev_end';
    return 'bev_idle';
  },
  paulette: (g) => {
    if (g.has('grantDone')) return 'paulette_done';
    if (g.questIs('campaign', 'active')) return 'paulette_apply';
    return 'paulette_idle';
  },
  gary: (g) => {
    if (g.has('garyResolved')) return g.isAlly('gary') ? 'gary_ally' : 'gary_resolved';
    if (g.questIs('neighbor', 'active')) return 'gary_confront';
    return 'gary_idle';
  },
  linda: (g) => {
    if (g.has('lindaResolved')) return g.isAlly('linda') ? 'linda_ally' : 'linda_resolved';
    if (g.questIs('neighbor', 'active')) return 'linda_confront';
    return 'linda_idle';
  },
  tonya: (g) => {
    if (g.has('tonyaResolved')) return 'tonya_after';
    if (g.questIs('neighbor', 'active')) return 'tonya_talk';
    return 'tonya_idle';
  },
  ronnie: (g) => {
    if (g.has('eventPermit') && !g.has('eventDone')) return 'ronnie_slam';
    if (g.questIs('neighbor', 'active') && g.has('garyResolved') && g.has('lindaResolved') && g.has('tonyaResolved') && !g.has('serviceDone')) return 'ronnie_service';
    if (g.questIs('neighbor', 'active')) return 'ronnie_neighbor_wait';
    if (g.isAlly('ronnie')) return 'ronnie_ally';
    return 'ronnie_idle';
  },
  pruitt: (g) => {
    if (g.questIs('memorial', 'active')) {
      const st = g.questStage('memorial');
      if (st === 0) return 'pruitt_first';
      if (st === 1) return 'pruitt_investigating';
      if (st === 2) return 'pruitt_report';
      if (st === 3) return 'pruitt_resolve';
    }
    if (g.questIs('memorial', 'done')) return 'pruitt_done';
    return 'pruitt_idle';
  },
  mason: (g) => (g.has('masonTalked') ? 'mason_again' : 'mason'),
  dennis: (g) => (g.has('dennisTalked') ? 'dennis_again' : 'dennis'),
  brenda: (g) => {
    if (g.has('finished_buy') || g.has('finished_build')) return 'brenda_after';
    if (g.questIs('elders', 'active') && g.questStage('elders') === 3) return 'brenda_buy';
    return 'brenda_idle';
  },
  hank: (g) => {
    if (g.has('finished_buy') || g.has('finished_build')) return 'hank_after';
    if (g.questIs('elders', 'active') && g.questStage('elders') === 3) return 'hank_build';
    return 'hank_idle';
  },
  // ---- objects ----
  desk: (g) => (!g.has('deskChecked') ? 'desk_first' : 'desk'),
  couch: () => 'couch',
  fileCabinet: (g) => (g.questIs('memorial', 'active') && g.questStage('memorial') === 1 && !g.has('minutesRead') ? 'cabinet_minutes' : 'cabinet'),
  bookshelf: () => 'bookshelf',
  benchPress: () => 'benchPress',
  pulpit: (g) => {
    if (g.has('preachedToday')) return 'pulpit_done';
    if (g.state.energy < BALANCE.sundayEnergyCost) return 'pulpit_tired';
    return 'pulpit';
  },
  tv: () => 'tv',
  thermostat: (g) => (g.questIs('hvac', 'active') && g.questStage('hvac') === 2 ? 'thermostat_fix' : 'thermostat'),
  chairs: () => 'chairs',
  churchCoffee: (g) => (g.has('coffeeToday') ? 'coffee_empty' : 'coffee_refill'),
  soundboard: (g) => (g.has('soundboardBroken') ? 'soundboard_broken' : 'soundboard'),
  laptop: () => 'laptop',
  stain: (g) => `stain_${Math.min(3, Math.floor(g.state.day / 4))}`,
  churchSign: () => 'churchSign',
  churchStreetSign: () => 'churchStreetSign',
  trailer: (g) => (g.has('trailerMissing') ? 'trailer_missing' : 'trailer'),
  truck: () => 'truck',
  acUnit: (g) => (g.has('hvacFixed') ? 'ac_fixed' : 'ac_unit'),
  dumpster: () => 'dumpster',
  memorialBench: (g) => (g.questIs('memorial', 'done') ? 'bench_after' : 'bench_moved'),
  benchSpot: (g) => (g.questIs('memorial', 'done') ? 'benchspot_after' : 'benchspot'),
  aptSign: () => 'aptSign',
  garyMailbox: () => 'garyMailbox',
  garyDoor: () => 'garyDoor',
  lindaDoor: () => 'lindaDoor',
  pruittDoor: () => 'pruittDoor',
  coffeeSign: () => 'coffeeSign',
  citySign: () => 'citySign',
  chapelDoor: () => 'chapelDoor',
  forSale: () => 'forSale',
  lotSign: () => 'lotSign',
  parkBench: (g) => (g.has('parkBenchToday') ? 'parkBench_done' : 'parkBench'),
  townSign: () => 'townSign',
  menu: () => 'cafeMenu',
  espresso: () => 'espresso',
  pastry: () => 'pastry',
  bulletin: () => 'bulletin',
  mayor: () => 'mayor',
  takeNumber: () => 'takeNumber',
  grantDeskSign: () => 'grantDeskSign',
};


/** Automatic dialogue when a map is entered (story beats). */
export function AUTO_DIALOGUE(g: Game, mapId: string): string | null {
  if (mapId === 'office' && !g.has('introDone')) return 'intro';
  if (mapId === 'town' && g.questIs('hvac', 'done') && g.questIs('memorial', 'inactive')) return 'voicemails';
  if (mapId === 'town' && g.questIs('memorial', 'done') && g.questIs('neighbor', 'inactive')) return 'neighborsIntro';
  if (mapId === 'town' && g.questIs('neighbor', 'done') && g.questIs('campaign', 'inactive')) return 'campaignIntro';
  if (mapId === 'church' && g.questIs('campaign', 'done') && g.questIs('elders', 'inactive')) return 'eldersIntro';
  return null;
}

/** NPC presence rules beyond simple flags. */
export function NPC_VISIBLE(g: Game, npcId: string, mapId: string): boolean {
  if (npcId === 'harold' && mapId === 'coffee') return !g.has('haroldAtCityHall');
  if (npcId === 'harold' && mapId === 'cityhall') return g.has('haroldAtCityHall');
  return true;
}

/** Tile changes driven by story flags: [x, y, layer, tileName|null]. */
export function MAP_OVERRIDES(g: Game, mapId: string): [number, number, 'g' | 'o', string | null][] {
  const out: [number, number, 'g' | 'o', string | null][] = [];
  if (mapId === 'town') {
    const outcome = g.flag('memorialChoice');
    if (outcome === 'restore' || outcome === 'garden') {
      out.push([34, 27, 'o', null]);
      out.push([17, 27, 'o', 'memorialBench']);
      out.push([17, 27, 'g', 'grass']);
    }
    if (outcome === 'garden') {
      out.push([16, 27, 'o', 'flowerBed']);
      out.push([16, 26, 'g', 'flowers']);
      out.push([17, 26, 'g', 'flowers']);
      out.push([15, 27, 'g', 'flowers']);
    }
    if (outcome === 'ceremony') {
      out.push([34, 26, 'g', 'flowers']);
      out.push([35, 27, 'g', 'flowers']);
    }
    if (g.has('trailerMissing')) { out.push([30, 30, 'o', null]); out.push([31, 30, 'o', null]); }
  }
  return out;
}

// =====================================================================
// Random events (triggered after resting, with cooldown)
// =====================================================================
interface RandomEvent { id: string; weight: number; once?: boolean; when?: (g: Game) => boolean }
const EVENTS: RandomEvent[] = [
  { id: 'ev_roofLeak', weight: 3, when: (g) => g.state.day > 2 },
  { id: 'ev_soundboard', weight: 3, once: true, when: (g) => !g.has('soundboardBroken') && g.state.day > 3 },
  { id: 'ev_trailer', weight: 2, once: true, when: (g) => !g.has('trailerMissing') && g.state.day > 4 },
  { id: 'ev_repairBill', weight: 3, when: (g) => g.state.day > 2 },
  { id: 'ev_gift', weight: 3 },
  { id: 'ev_volunteer', weight: 2 },
  { id: 'ev_neighborHelp', weight: 3, when: (g) => g.questIs('neighbor', 'done') },
  { id: 'ev_ledWall', weight: 2, once: true, when: (g) => g.state.day > 5 },
  { id: 'ev_fanBreaker', weight: 6, once: true, when: (g) => g.has('hvacFans') && !g.has('hvacFixed') },
  { id: 'ev_pruittCake', weight: 3, once: true, when: (g) => g.isAlly('pruitt') },
  { id: 'ev_blackhawks', weight: 2, when: (g) => g.state.day > 2 },
];

export function pickRandomEvent(g: Game): string | null {
  const pool = EVENTS.filter((e) => (!e.once || !g.state.seenEvents.includes(e.id)) && (!e.when || e.when(g)));
  if (!pool.length) return null;
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.weight; if (r <= 0) { g.state.seenEvents.push(e.id); return e.id; } }
  const last = pool[pool.length - 1];
  g.state.seenEvents.push(last.id);
  return last.id;
}

// =====================================================================
// THE DIALOGUE
// =====================================================================
export const DIALOGUE: Dialogues = {
  // ---------------------------------------------------------------- intro
  intro: [
    N('{town}, {sage}\'s favorite church-planting town. A warehouse with a cross on it. Tuesday.'),
    N('Inside the warehouse: one pastor, one desk, one couch that has seen things.'),
    N('Sent out by {sendingChurch} with a community group, a trailer, and a dream. Formerly {formerName}. The Comms team is still finding old logos.'),
    ME('Okay. New week. New mercies. New... smell? Is that the ceiling?', 'tired'),
    ME('Focus. Sunday is coming. It always is. It is the most reliable thing about Sunday.'),
    N('Your desk has a sticky note on it. Check the desk, then head out the door at the bottom of the room.'),
    N('(Move with the arrow keys or WASD. Press SPACE or ENTER to talk and check things. ESC or TAB opens your journal.)'),
    { effects: [{ set: 'introDone' }, { quest: ['intro', 'active', 0] }] },
  ],
  desk_first: [
    N('A sticky note, in your handwriting: "1. Fix everything. 2. Build a church. 3. Bench 300."'),
    N('Under it, a second note: "Kyle says the AC is making a noise. Go see Kyle."'),
    { effects: [{ set: 'deskChecked' }] },
    ME('Kyle is at the sound booth. Kyle is always at the sound booth. I think he sleeps there.'),
  ],
  desk: [
    N('Inbox: 214 unread. Subject lines include "quick question", "Quick Question", "QUICK QUESTION???" and "re: the old Real Life banner (can we burn it)".'),
    { if: (g) => g.questIs('campaign', 'active'), then: 'desk_campaign' },
    { if: (g) => g.questIs('memorial', 'active'), then: 'desk_memorial' },
    ME('I\'ll answer those. Later. After the building. After the rapture, possibly.', 'tired'),
  ],
  desk_campaign: [
    N('A text from {sage}: "Capital campaign. Three legs: an event, a grant, a donor. Do all three. Love you. Bald guys stick together."'),
    ME('He knows I\'m bald because I choose to be. Mostly.'),
  ],
  desk_memorial: [
    N('Email thread: "RE: RE: FWD: RE: the BENCH (please read all)". 47 messages. You read none of them.'),
    ME('Harold started this one. Harold started the last one too.'),
  ],
  couch: [
    N('The couch. Brown. Loyal. Slightly concave in the shape of a pastor.'),
    { choice: [
      { label: 'Rest until tomorrow', goto: 'couch_rest' },
      { label: 'Not yet', goto: 'couch_no' },
    ] },
  ],
  couch_rest: [
    ME('Five minutes. Just five... minutes...', 'tired'),
    { effects: [{ restDay: true }] },
  ],
  couch_no: [ME('No. Sunday is coming. It knows where I live.')],
  cabinet: [
    N('Files: "Bylaws (2019)", "Bylaws (2019) FINAL", "Bylaws (2019) FINAL v2", "Taxes?", and one folder simply labeled "Harold."'),
  ],
  cabinet_minutes: [
    N('You dig past "Bylaws (2019) FINAL v2" and find: "Landscape Subcommittee Minutes, June 2019."'),
    N('"Item 4: Memorial bench to be relocated for the new dumpster pad. ACTION: Notify the Pruitt and Whitfield families. ASSIGNED TO: ___________."'),
    N('The blank is still blank. Under it, in pencil: "Harold said he would handle it."'),
    ME('So the bench got moved for a dumpster, nobody told the families, and the assignment went to nobody. Classic.', 'tired'),
    { effects: [{ set: 'minutesRead' }] },
    { if: (g) => g.has('haroldTalked'), then: 'memorial_stage2' },
  ],
  memorial_stage2: [
    ME('Okay. I know who and I know why. Mrs. Pruitt deserves to hear it from me, in person.'),
    { effects: [{ stage: ['memorial', 2] }] },
  ],
  bookshelf: [
    N('Commentaries, a Greek lexicon, "Church Planting for Regular People" by {sage}, and a well-worn WWE almanac.'),
    ME('All of these are theology if you read them right.'),
  ],
  benchPress: [
    N('A bench press. In a pastor\'s office. Of course.'),
    { choice: [
      { label: 'Lift (costs 10 energy)', goto: 'bench_lift', disabled: (g) => g.state.energy < 10, disabledText: 'Too tired to lift safely.' },
      { label: 'Admire it', goto: 'bench_admire' },
    ] },
  ],
  bench_lift: [
    N('You rack the bar. You breathe. You lift.'),
    N('It is not 300. It is close enough that the elders would have no questions.'),
    ME('"' + S.bench300 + '"', 'smug'),
    { effects: [{ energy: -10, morale: 2, sfx: 'thud' }] },
  ],
  bench_admire: [ME('Someday, elders. Someday you will all be tested.', 'smug')],

  // ---------------------------------------------------------------- church objects
  pulpit: [
    N('The pulpit. Technically a music stand with ambitions.'),
    { choice: [
      { label: `Hold Sunday service (-${BALANCE.sundayEnergyCost} energy)`, goto: 'preach' },
      { label: 'Just stand here a moment', goto: 'pulpit_moment' },
    ] },
  ],
  pulpit_moment: [ME('Lord, I am not asking for a lot. Just a building. And a working thermostat. And for Harold to find the "reply" button, singular.')],
  pulpit_tired: [
    N('You put your hands on the pulpit. Your hands put themselves back down.'),
    ME(`I need at least ${BALANCE.sundayEnergyCost} energy to preach. Couch. Coffee. Then Sunday.`, 'tired'),
  ],
  pulpit_done: [N('You already preached today. Even Sunday only happens once a week. Rest on the office couch to start a new day.')],
  preach: [
    { if: (g) => g.has('hvacFans') && !g.has('hvacFixed') && !g.has('sweatyDone'), then: 'preach_sweaty' },
    { goto: 'preach_normal' },
  ],
  preach_sweaty: [
    N('Sunday. The box fans are set to "airport". The thermostat is set to "denial".'),
    { encounter: 'crowd', win: 'preach_sweaty_win', lose: 'preach_sweaty_lose' },
  ],
  preach_sweaty_win: [
    { effects: [{ set: 'sweatyDone' }, { morale: 4 }] },
    { goto: 'preach_normal' },
  ],
  preach_sweaty_lose: [
    { effects: [{ set: 'sweatyDone' }] },
    N('The offering plate still goes around. People are generous when they want to leave.'),
    { goto: 'preach_normal' },
  ],
  preach_normal: [
    N('The band plays. Brayden\'s slides have one typo ("Jesus Lovs You"). Kyle catches the feedback before it howls. Mostly. The livestream has four viewers. One is Kyle checking the livestream.'),
    N('The website says each service is "roughly an hour." Roughly. The word is doing a lot of work today.'),
    { effects: [{ custom: (g) => {
      const offering = BALANCE.sundayBaseOffering + Math.round(g.state.morale * BALANCE.sundayMoralePerDollar);
      g.set('lastOffering', offering);
      g.change('energy', -BALANCE.sundayEnergyCost);
      g.change('fund', offering);
      g.change('morale', BALANCE.sundayMoraleGain);
      g.set('preachedToday', true);
      g.inc('services');
    } }] },
    N('You preach. It lands. Somebody says "good word" and means it. The offering comes in.'),
    { if: (g) => (g.flag('services') as number) === 1, then: 'preach_first' },
    ME('Another Sunday. We\'re still here. That\'s not nothing.', 'happy'),
  ],
  preach_first: [
    N('(Sunday services are your steady income: the base offering plus a bonus for congregation morale. You can preach once per day; rest on the couch to start a new day.)'),
    ME('Another Sunday. We\'re still here. That\'s not nothing.', 'happy'),
  ],
  tv: [
    N('A 65-inch TV bolted to the wall. It displays a countdown timer and the words "How do I give?" (Church Center app, text-to-give, or the box that used to be a mailbox.)'),
    ME('"' + S.ledWall + '"', 'happy'),
    { if: (g) => g.isAlly('gary'), then: 'tv_gary' },
    ME('One day. One glorious, pixel-dense day.'),
  ],
  tv_gary: [ME('Gary says he can wire one. Gary says a lot of things. Gary is usually right.', 'smug')],
  thermostat: [
    { if: (g) => g.has('hvacFixed'), then: 'thermostat_fixed' },
    { if: (g) => g.has('hvacFans'), then: 'thermostat_fans' },
    N('The thermostat reads 68. The room reads 84. One of them is lying.'),
  ],
  thermostat_fixed: [N('The thermostat reads 70. The room reads 70. Peace in our time.')],
  thermostat_fans: [N('The thermostat reads 68. The room reads "box fan". It is fine. It is fine.'), ME('{curse} {oops}', 'tired')],
  thermostat_fix: [
    { if: (g) => g.has('hvacFixed'), then: 'thermostat_fix_good' },
    { goto: 'thermostat_fix_fans' },
  ],
  thermostat_fix_good: [
    N('Cold air. Actual cold air. It hits your face like grace.'),
    ME('Thank you, Dale. Thank you, Lord. In that order today, sorry.', 'happy'),
    { effects: [{ quest: ['hvac', 'done'], outcome: ['hvac', 'Fixed. Cold air restored. Dale respected.'] }] },
  ],
  thermostat_fix_fans: [
    N('Twelve box fans hum in the sanctuary. It sounds like a very calm helicopter.'),
    ME('Temporary. This is temporary. Everything is temporary. Especially this.', 'tired'),
    { effects: [{ quest: ['hvac', 'done'], outcome: ['hvac', 'Box fans. Twelve of them. The breaker is nervous.'] }] },
  ],
  chairs: [N('Padded stackable chairs. Gray. Each one has been sat in by someone who was nervous the first time and family by the tenth.')],
  coffee_refill: [
    N('The coffee station. A commercial brewer Doug found on Facebook Marketplace, and a box of donuts. The website promises free coffee AND donuts. The website is binding.'),
    { choice: [
      { label: `Coffee Refill (+${BALANCE.coffeeRefillEnergy} energy)`, goto: 'coffee_drink' },
      { label: 'Not now', goto: 'coffee_skip' },
    ] },
  ],
  coffee_drink: [
    N('You pour a cup the size of a fire extinguisher. Black. Terrifying. Perfect. You take a donut with sprinkles, which nobody saw.'),
    { effects: [{ energy: BALANCE.coffeeRefillEnergy, set: 'coffeeToday', sfx: 'heal' }] },
    ME('Okay. Okay okay okay. Let\'s go.', 'happy'),
  ],
  coffee_skip: [ME('Later. Discipline is a fruit of the Spirit. Coffee is too, probably. Somewhere in the Greek.')],
  coffee_empty: [
    N('The pot is empty and the donut box holds one plain donut and a lot of sprinkles. Someone took the last good one and did not start a new pot. You know who. You forgive them. Slowly.'),
    ME('{curse} {oops}', 'angry'),
  ],
  soundboard: [
    N('A 24-channel mixer. 19 channels are labeled with tape. One label just says "DO NOT."'),
    ME('Kyle\'s domain. I don\'t touch it. I barely look at it.'),
  ],
  soundboard_broken: [
    N('The board is dark. Channel 7 smells like a campfire.'),
    ME('Kyle\'s working on it. Kyle is always working on it.', 'tired'),
  ],
  laptop: [N('The slides laptop. The wallpaper is Brayden\'s dog. The dog is wearing a tie. The dog looks more prepared than you.')],
  stain_0: [
    N('A brown stain on the ceiling tile, above a bucket. The stain is roughly the size of a dinner plate.'),
    ME('It\'s fine. It\'s been there since we moved in. It\'s basically a founding member.'),
  ],
  stain_1: [
    N('The stain has grown. It is now the size of a large pizza. It looks a little like Ohio.'),
    ME('Why does it look like Ohio.', 'shocked'),
  ],
  stain_2: [
    N('The stain is the size of a card table. Two buckets now. Somebody drew a smiley face on the tile next to it.'),
    ME('{curse} Okay, Ohio is now Ohio AND West Virginia. This is a regional situation.', 'tired'),
  ],
  stain_3: [
    N('The stain has a name now. Doug calls it "Big Brown." Tasha calls it "the reason we are building." Both are correct.'),
    ME('You are the reason we are building, Big Brown. You are my Ebenezer. Hitherto hath the ceiling held.', 'smug'),
  ],

  // ---------------------------------------------------------------- church people
  kyle_hvac_start: [
    L('kyle', 'Pastor. Good. The AC made a noise.'),
    ME('What kind of noise?'),
    L('kyle', 'The kind where it stops making noise afterward.', 'sad'),
    L('kyle', 'It\'s dead. Sunday\'s in five days. The forecast says 94. I checked twice, hoping it would change. It did not.'),
    ME('Okay. Okay. Who fixes AC around here?', 'tired'),
    L('kyle', 'Dale. Dale\'s Heating, Cooling & Bass Fishing. He\'s at Third Place Coffee every morning. Big beard, ball cap, mad at something.'),
    ME('Sounds like half the men in this church. Got it. Third Place Coffee. Across the main road, north side.'),
    { effects: [{ quest: ['intro', 'done'], outcome: ['intro', 'Found out what was on fire. It was the AC. Ironically.'] }, { quest: ['hvac', 'active', 0] }] },
  ],
  kyle_hvac_hint: [L('kyle', 'Dale. Third Place Coffee. North across the main road. Tell him Kyle sent you, then tell him you don\'t know a Kyle. It\'s a bit we have.')],
  kyle_hvac_check: [L('kyle', 'Check the thermostat on the back wall. If it says anything under 80 I\'ll cry.')],
  kyle_board_broken: [
    L('kyle', 'Channel 7 died. Just... went to be with the Lord.', 'sad'),
    L('kyle', 'I can rebuild it. Give me a day and some solder and nobody talk to me.'),
  ],
  kyle_wrestling: [
    L('kyle', 'A wrestling show. In here. I\'m going to need... all of the cables. Every cable in {town}.', 'shocked'),
    L('kyle', 'Also I want to run the entrance music. I have a whole thing planned. Organ. Then bass drop. Then organ again.', 'happy'),
  ],
  kyle_end: [L('kyle', 'A real building. With a real booth. With a DOOR. I might cry. I won\'t. But I might.', 'happy')],
  kyle_idle: [
    { if: (g) => g.has('preachedToday'), then: 'kyle_idle2' },
    { if: (g) => g.state.day % 3 === 0, then: 'kyle_impact' },
    L('kyle', 'Sound check is at 9. It\'s always at 9. It has never once been at 9.'),
  ],
  kyle_impact: [
    L('kyle', 'Wednesday. {youth} night, {youthNight}. Sixth through twelfth grade. Decibels I have never seen on a Sunday.', 'tired'),
    L('kyle', 'Last week they asked for a fog machine. I said we don\'t have one. We have one. It\'s hidden.'),
  ],
  kyle_idle2: [L('kyle', 'That feedback squeal during the second song? That was the Holy Spirit. Or channel 7. Hard to say.')],
  brayden: [
    L('brayden', 'Pastor, is "Jesus Lovs You" a typo or, like, a vibe?'),
    L('brayden', 'Also the {youth} group chat wants to know if Wednesday can have pizza. It\'s a 34-message thread. About pizza.'),
    ME('It\'s a typo, Brayden.'),
    L('brayden', 'Yeah but what if it\'s a vibe.'),
    { if: (g) => g.has('tashaAsked'), then: 'brayden_recruit' },
  ],
  brayden_recruit: [
    ME('Hey. Tasha needs a nursery helper Sunday. Two hours. Free snacks.'),
    L('brayden', 'Snacks?', 'shocked'),
    L('brayden', '...Yeah okay. I\'m in. Don\'t tell anyone I\'m nice.', 'happy'),
    { effects: [{ set: 'braydenHelped' }, { morale: 5 }] },
    ME('Your secret is safe. Your slides are not. Fix "Lovs".'),
  ],
  brayden_after: [L('brayden', 'I did the nursery thing. A toddler called me "Bread." I answer to Bread now.', 'happy')],
  tasha_intro: [
    L('tasha', 'Pastor. Harvest Babees, Harvest Tots, Little Kids, Big Kids. Four classes. One helper. The helper is me.', 'tired'),
    L('tasha', 'The Tots have organized. One of them has a clipboard. I need a body. Any body. A teenager. A deacon. A tall dog.'),
    ME('I\'ll find someone. Brayden owes me for the typos.'),
    { effects: [{ set: 'tashaAsked' }] },
  ],
  tasha_waiting: [L('tasha', 'Any luck? The toddlers are organizing. One of them has a clipboard.', 'shocked')],
  tasha_after: [L('tasha', 'Brayden showed up! The Harvest Tots call him Bread. He seems at peace with it. The Big Kids call him "sir." He does not.', 'happy')],
  doug_idle: [
    L('doug', 'Pastor. I built that coffee counter. With these hands. Two-by-fours and prayer.'),
    L('doug', '"' + S.bench300 + '" That\'s what you said, right? I got the elders on a program.', 'smug'),
    ME('I said it once. As a joke. Mostly.'),
    L('doug', 'Marcus is up to 95.'),
  ],
  doug_wait: [L('doug', 'Marcus has the spreadsheet open. Go put it out of its misery.')],
  doug_end: [L('doug', 'Head of the build team. Got a hat that says it. Made the hat myself.', 'happy')],
  marcus_idle: [
    L('marcus', 'Our giving is up 6% year over year. Our expenses are up 11%. One of those numbers is Big Brown.'),
    ME('The stain has a line item?'),
    L('marcus', 'The stain has a TAB.'),
  ],
  marcus_wait: [L('marcus', 'Doug wants to talk vision first. I\'ll be here. With the tabs.')],
  marcus_wait2: [L('marcus', 'Janet has the carpet samples out. God be with you.')],
  marcus_end: [L('marcus', 'I\'ve built a new spreadsheet. It\'s called "Actually Happening." It has one tab.', 'happy')],
  janet_idle: [
    L('janet', 'Pastor, if we ever get a real building, I have thoughts on carpet.'),
    ME('I\'m sure you do.'),
    L('janet', 'Fourteen thoughts. I made a binder.', 'smug'),
  ],
  janet_wait: [L('janet', 'I\'ll wait my turn. The carpet has waited 40 years. It can wait one more meeting.')],
  janet_end: [L('janet', 'For the record: nobody remembers what color we picked. I do. I\'ll never tell.', 'smug')],
  member1: [
    { if: (g) => g.questIs('elders', 'done'), then: 'member1_end' },
    L('member1', 'Pastor! Our {groups} meets Tuesdays. We have never once finished the study. We have finished many casseroles.'),
    L('member1', 'Also, love the sermon series. The one on patience. Any idea when it ends?'),
    ME('"' + S.bestChurch + '"', 'smug'),
    L('member1', 'That\'s not an answer but I agree with it.', 'happy'),
  ],
  member1_end: [L('member1', 'I told my sister we\'re getting a building. She said "your church?" I said "my church." Felt good.', 'happy')],
  member2: [
    { if: (g) => g.has('hvacFans') && !g.has('hvacFixed'), then: 'member2_hot' },
    L('member2', 'Is it true we might get a building with, like, walls that go all the way up?'),
    ME('Walls, ceilings, possibly a hallway.'),
    L('member2', 'A HALLWAY.', 'shocked'),
    L('member2', 'When we were still a {groups} out of {sendingChurch} we met in a living room. We have come so far. We have a bucket now.'),
  ],
  member2_hot: [L('member2', 'It\'s hot. It\'s hot in a way that feels theological.', 'tired')],

  // ---------------------------------------------------------------- Q1: HVAC
  dale_meet: [
    N('A man with a beard and a biscuit. Ball cap says "DALE\'S: HEATING, COOLING & BASS."'),
    ME('Dale? Kyle sent me. I don\'t know a Kyle.'),
    L('dale', 'Church AC. Let me guess. Sunday.', 'angry'),
    N('This is going to take some actual conversation. (Your first encounter! Try LISTEN first: it reveals what works on people.)'),
    { encounter: 'dale', win: 'dale_win', lose: 'dale_lose' },
  ],
  dale_lose: [
    L('dale', 'I\'ll call you.'),
    N('He will not call you. But he\'ll be here tomorrow, same stool. Try again after some rest or coffee.'),
  ],
  dale_win: [
    { effects: [{ stage: ['hvac', 1] }] },
    { goto: 'dale_options' },
  ],
  dale_options: [
    L('dale', 'Here\'s the deal. Your compressor\'s shot. Three ways this goes.'),
    L('dale', `One: I fix it right, this week. ${money(BALANCE.hvacFullRepair)}. Cold air Sunday. Done.`),
    L('dale', `Two: I bring the part, your guy with the truck helps me lift it, you buy me lunch. ${money(BALANCE.hvacVolunteerRepair)}. Takes a day and some sweat.`),
    L('dale', `Three: box fans. ${money(BALANCE.hvacFansCost)} at the hardware store. I don't recommend it. I've SEEN it.`),
    { choice: [
      { label: `Full repair (${money(BALANCE.hvacFullRepair)})`, goto: 'hvac_full', disabled: (g) => g.state.fund < BALANCE.hvacFullRepair, disabledText: `Not enough in the fund. Preach a Sunday or pick another plan.` },
      { label: `Volunteer repair (${money(BALANCE.hvacVolunteerRepair)}, 25 energy)`, goto: 'hvac_volunteer', disabled: (g) => g.state.fund < BALANCE.hvacVolunteerRepair || g.state.energy < 25, disabledText: 'Need the money and 25 energy for a day of lifting.' },
      { label: `Box fans (${money(BALANCE.hvacFansCost)})`, goto: 'hvac_fans', disabled: (g) => g.state.fund < BALANCE.hvacFansCost, disabledText: 'You cannot even afford fans. Preach a Sunday first.' },
      { label: 'Let me think about it', goto: 'hvac_think' },
    ] },
  ],
  hvac_think: [L('dale', 'Think fast. It\'s gonna be 94.')],
  hvac_full: [
    { effects: [{ fund: -BALANCE.hvacFullRepair }, { set: 'hvacFixed' }, { morale: 6 }, { stage: ['hvac', 2] }] },
    L('dale', 'Smart. Painful, but smart. I\'ll have it running by Thursday.'),
    ME('That was most of the fund. But cold people don\'t give, and hot people don\'t come back.'),
    N('Go check the thermostat at the church.'),
  ],
  hvac_volunteer: [
    { effects: [{ fund: -BALANCE.hvacVolunteerRepair }, { energy: -25 }, { set: 'hvacFixed' }, { ally: 'ronnie' }, { ally: 'dale' }, { morale: 9 }, { stage: ['hvac', 2] }] },
    N('The next day. Big Ronnie backs his truck up to the unit. Dale points. Ronnie lifts. You mostly hold a flashlight.'),
    L('dale', 'Your guy lifts like a forklift with feelings. Alright. It\'s running.', 'happy'),
    L('ronnie', 'Pastor, anytime you need something moved, lifted, or intimidated: I got a truck.', 'happy'),
    ME('A Volunteer With a Truck. The most powerful force in ministry.', 'happy'),
    N('Dale and Ronnie are allies now. Go check the thermostat at the church.'),
  ],
  hvac_fans: [
    { effects: [{ fund: -BALANCE.hvacFansCost }, { set: 'hvacFans' }, { morale: -5 }, { stage: ['hvac', 2] }] },
    L('dale', 'Twelve box fans. May God have mercy on your breaker box.', 'angry'),
    ME('It\'s temporary. It\'s a bridge. It\'s a loud, wobbly bridge.'),
    N('Go check the thermostat at the church. Sunday may be... spirited.'),
  ],
  dale_after: [L('dale', 'Go check the thermostat. I don\'t drive out there for fun.')],
  dale_done: [L('dale', 'Church AC guy. That\'s what they call me now. I had a whole identity before you.')],
  dale_ally: [
    L('dale', 'Roof leaks, water heater, whatever. Call me. I answer on the first ring now. It\'s upsetting.', 'happy'),
  ],
  dale_idle: [L('dale', 'Bass are biting on the Cumberland. That\'s all I got for you.')],

  // ---------------------------------------------------------------- Q2: Memorial
  voicemails: [
    N('Your phone buzzes. Four voicemails from Mrs. Pruitt. One text that just says "the BENCH."'),
    ME('The memorial bench. Her parents\' bench. What happened to the memorial bench?', 'shocked'),
    N('New quest. Mrs. Pruitt lives in the white house, north-west, up the road past the intersection.'),
    { effects: [{ quest: ['memorial', 'active', 0] }] },
  ],
  pruitt_idle: [L('pruitt', 'Pastor. Lovely day. My hydrangeas are thriving, unlike some things.')],
  pruitt_first: [
    L('pruitt', 'Pastor. Thank you for coming. I\'ve been trying to reach someone for a week.', 'sad'),
    L('pruitt', 'My parents helped start that church. When they passed, we put in a bench. By the flowers. It said "Come and rest."'),
    L('pruitt', 'Last Sunday I drove by. The bench is next to the DUMPSTER. Facing the dumpster. As if to say: come and rest, here, by the trash.', 'angry'),
    ME('Mrs. Pruitt, I didn\'t know. I\'m sorry. I should have known.'),
    L('pruitt', 'Then Harold started an email thread. Forty-seven emails. My cousin in Ohio is on it now. She has never been to Tennessee.', 'tired'),
    L('pruitt', 'I don\'t want emails. I want to know WHO moved my parents and WHY, and I want someone to say it to my face.'),
    ME('Then that\'s what you\'ll get. Let me find out.'),
    N('Check the files in your office. And talk to Harold. He\'s usually at the coffee shop.'),
    { effects: [{ stage: ['memorial', 1] }] },
  ],
  pruitt_investigating: [L('pruitt', 'Find out who. Find out why. Then come back. I\'ll have tea. I will not have patience, but I\'ll have tea.')],
  pruitt_report: [
    ME('Mrs. Pruitt. Here it is, plainly.'),
    ME('In 2019 the landscape committee moved the bench to make room for a dumpster pad. They wrote "notify the families." Nobody was assigned. Harold said he\'d handle it, then forgot, then panicked, then hit Reply All.'),
    L('pruitt', '...A dumpster pad.', 'shocked'),
    L('pruitt', 'Not malice. Not even indifference. Just a blank line on a form that nobody filled in.', 'sad'),
    ME('That\'s the church, sometimes. Good people and a blank line. I\'m sorry. I\'d like to fix it. Actually fix it.'),
    L('pruitt', 'Then first, Pastor: make the emails stop. I cannot think with my cousin in Ohio replying "prayers" every four hours.'),
    N('Time to deal with the email thread. It\'s a live one.'),
    { effects: [{ stage: ['memorial', 3] }] },
    { encounter: 'thread', win: 'thread_win', lose: 'thread_lose' },
  ],
  thread_lose: [
    L('pruitt', 'Still buzzing. Go rest and try again, dear. The thread will be here. It will always be here.', 'tired'),
  ],
  thread_win: [
    L('pruitt', 'It stopped. It actually stopped.', 'shocked'),
    { goto: 'pruitt_resolve' },
  ],
  pruitt_resolve: [
    L('pruitt', 'Now. What do we do about my parents?'),
    ME('Three ideas. You pick. It\'s your family.'),
    { choice: [
      { label: `Restore it: move the bench back (${money(BALANCE.memorialRestore)})`, goto: 'memorial_restore', disabled: (g) => !g.isAlly('ronnie') && g.state.fund < BALANCE.memorialRestore, disabledText: 'Need the money for a mover, or a friend with a truck.' },
      { label: `Memorial garden (${money(BALANCE.memorialGarden)})`, goto: 'memorial_garden', disabled: (g) => g.state.fund < BALANCE.memorialGarden, disabledText: 'Not enough in the fund for a garden yet.' },
      { label: 'Dedication ceremony (25 energy)', goto: 'memorial_ceremony', disabled: (g) => g.state.energy < 25, disabledText: 'You need 25 energy to do this right.' },
      { label: 'Give me a day to arrange it.', goto: 'memorial_later' },
    ] },
  ],
  memorial_later: [L('pruitt', 'One day. I have waited four years; I can wait one day. Not two.', 'smug')],
  memorial_restore: [
    { if: (g) => g.isAlly('ronnie'), then: 'memorial_restore_truck' },
    { effects: [{ fund: -BALANCE.memorialRestore }] },
    { goto: 'memorial_restore_done' },
  ],
  memorial_restore_truck: [
    N('Ronnie shows up with the truck, two straps, and no questions. The bench is back by the flowers in eleven minutes.'),
    L('ronnie', 'Volunteer With a Truck. Never doubt it.', 'happy'),
    { goto: 'memorial_restore_done' },
  ],
  memorial_restore_done: [
    N('The bench is back where it belongs. "Come and rest." Facing the flowers. Facing the door.'),
    L('pruitt', 'That\'s all I wanted. That was ALL I wanted.', 'happy'),
    { effects: [{ setValue: ['memorialChoice', 'restore'] }, { quest: ['memorial', 'done'], outcome: ['memorial', 'Bench restored by the flowers. Harold has been talked off Reply All.'] }, { ally: 'pruitt' }, { ally: 'harold' }, { set: 'haroldAtCityHall' }, { morale: 6 }, { goodwill: 6 }] },
    L('pruitt', 'I\'ll be back Sunday. Second row. Don\'t make a thing of it.'),
  ],
  memorial_garden: [
    { effects: [{ fund: -BALANCE.memorialGarden }] },
    N('A week later: the bench, restored, surrounded by a small garden. Hydrangeas. A stone path. A plaque that lists every name from the old church, not just two.'),
    L('pruitt', 'You put ALL the names. Even the Whitfields. Harold\'s aunt.', 'shocked'),
    L('pruitt', 'Pastor, that\'s... that\'s what a church is supposed to do.', 'happy'),
    { effects: [{ setValue: ['memorialChoice', 'garden'] }, { quest: ['memorial', 'done'], outcome: ['memorial', 'A memorial garden with every name. The whole town noticed.'] }, { ally: 'pruitt' }, { ally: 'harold' }, { set: 'haroldAtCityHall' }, { morale: 9 }, { goodwill: 12 }] },
    L('pruitt', 'I\'m bringing pound cake Sunday. And my cousin from Ohio. She wants to see the plaque.'),
  ],
  memorial_ceremony: [
    { effects: [{ energy: -25 }] },
    N('Sunday. You stop the service halfway. You read the names. Mrs. Pruitt stands. Harold stands. Half the room stands and nobody told them to.'),
    N('The bench stays where it is, but nobody will ever see the dumpster again. They\'ll see the moment.'),
    L('pruitt', 'Harold cried. HAROLD. I have known him fifty years.', 'shocked'),
    L('harold', 'Allergies.', 'sad'),
    { effects: [{ setValue: ['memorialChoice', 'ceremony'] }, { quest: ['memorial', 'done'], outcome: ['memorial', 'A dedication Sunday nobody will forget. Harold cried. Allergies.'] }, { ally: 'pruitt' }, { ally: 'harold' }, { set: 'haroldAtCityHall' }, { morale: 14 }, { goodwill: 5 }] },
    L('pruitt', 'Thank you, Pastor. Come and rest. Both of us.', 'happy'),
  ],
  pruitt_done: [
    L('pruitt', 'Second row. Every Sunday. I\'m a menace to the ushers now.', 'happy'),
    { if: (g) => g.questIs('elders', 'active'), then: 'pruitt_elders' },
  ],
  pruitt_elders: [L('pruitt', 'The elders listen to me, you know. I brought Janet pound cake. Sage carpet, by the way. Burgundy shows coffee.', 'smug')],
  harold_idle: [L('harold', 'Deacon Emeritus. It means I have opinions but no keys.')],
  harold_confess: [
    L('harold', 'Pastor. Before you say anything. I know.', 'sad'),
    ME('The bench.'),
    L('harold', 'The dumpster truck kept clipping it. I moved it myself, with my nephew, to keep it safe. Then I was supposed to tell the families. And I... didn\'t. I forgot. For four years.'),
    L('harold', 'And when Mrs. Pruitt found out, I panicked, and I thought if I explained it to EVERYONE at once it would be transparent, and...', 'tired'),
    ME('You hit Reply All.'),
    L('harold', 'Forty-seven times.', 'sad'),
    ME('Harold. You tried to protect the bench and then you hid. Both of those are human. Only one of them is a problem.'),
    L('harold', 'Tell her I\'m sorry. No. Don\'t. I should. I will. Just... help me make it stop first.'),
    { effects: [{ set: 'haroldTalked' }] },
    { if: (g) => g.has('minutesRead'), then: 'memorial_stage2' },
  ],
  harold_wait: [L('harold', 'I\'m staying off email. I\'ve been staying off email for an hour. It\'s the longest hour of my life.', 'tired')],
  harold_done: [L('harold', 'I apologized. In person. Like a caveman. It was wonderful.', 'happy')],
  harold_city: [
    L('harold', 'Pastor! I\'m volunteering at City Hall now. Zoning board liaison. Turns out I know everyone here from 30 years of complaining.'),
    L('harold', 'If the elders get stuck on city requirements, remind them Harold\'s on it. Also I muted the church email list. For everyone. You\'re welcome.', 'smug'),
  ],
  bench_moved: [
    N('A stone bench. "Come and rest." It faces the dumpster. Someone has put a potted plant on it, which somehow makes it worse.'),
    { if: (g) => g.questIs('memorial', 'inactive'), then: 'bench_moved_early' },
    ME('This is going to be a whole thing. It should be. It matters.'),
  ],
  bench_moved_early: [ME('Huh. When did the memorial bench end up back here? Somebody\'s going to have feelings about that.')],
  bench_after: [N('The memorial bench. "Come and rest." You do, for a second. It\'s a good bench.')],
  benchspot: [
    N('A bare patch of dirt by the flowers. Something used to be here. Something with a plaque.'),
  ],
  benchspot_after: [N('The flowers are doing well here. Mrs. Pruitt waters them. She claims she doesn\'t.')],
  dumpster: [
    N('The dumpster. Green. Enormous. It has a 2019 dumpster pad that cost a friendship.'),
    ME('You\'d better be worth it.'),
  ],

  // ---------------------------------------------------------------- Q3: Neighbors
  neighborsIntro: [
    N('Three separate neighbors have complained about the church this week. That\'s a personal record.'),
    N('Gary (west, by his mailbox) is upset about parking. Linda (east of the lot) is upset about noise. Tonya at the apartments has "concerns."'),
    ME('Love thy neighbor. It never says "the easy ones."', 'tired'),
    { effects: [{ quest: ['neighbor', 'active', 0] }] },
  ],
  gary_idle: [L('gary', 'Sunday. 10:15. A Tahoe. Every week.', 'angry')],
  gary_confront: [
    N('Gary is standing by his mailbox like it owes him money.'),
    { encounter: 'gary', win: 'gary_win', lose: 'gary_lose' },
  ],
  gary_lose: [N('The blinds close. Gary will be back at the mailbox tomorrow. He\'s always at the mailbox.')],
  gary_win: [
    L('gary', 'Retired electrician, by the way. Forty years. If that warehouse ever needs real wiring, I\'m next door.'),
    ME('Gary. How cool would an LED wall be.'),
    L('gary', '...Go on.', 'smug'),
    { effects: [{ set: 'garyResolved' }, { goodwill: 8 }] },
    N('Gary\'s on board. Now the others.'),
  ],
  gary_resolved: [L('gary', 'Cones are ordered. Orange. Forty of them. I may have overdone it.')],
  gary_ally: [L('gary', 'Parking team\'s running like a Swiss watch. Also I looked at LED panels. Don\'t tell Marcus.', 'happy')],
  linda_idle: [L('linda', 'Praise band. 9:45 AM. Decibels.', 'angry')],
  linda_confront: [
    N('Linda has a clipboard. The clipboard has photos on it.'),
    { encounter: 'linda', win: 'linda_win', lose: 'linda_lose' },
  ],
  linda_lose: [N('Linda underlines something. She\'ll be in the yard again tomorrow, with the clipboard.')],
  linda_win: [
    L('linda', 'Eleven years on the zoning board. I know every setback rule in {town}. And every person who enforces them.'),
    L('linda', 'Thursday coffee. I\'ll bring the parking plan. And brownies, if you\'re lucky.', 'happy'),
    { effects: [{ set: 'lindaResolved' }, { goodwill: 8 }] },
  ],
  linda_resolved: [L('linda', 'The figurines have been relocated to an interior wall. We\'re fine. We\'re all fine. The Blackhawks from post fly over at 9:45 and THAT noise I have never once complained about.')],
  linda_ally: [L('linda', 'I told the zoning board you were "one of the reasonable ones." That\'s the highest honor I give.', 'smug')],
  tonya_idle: [L('tonya', 'Apartment manager. Twenty-four units. Forty-one opinions.')],
  tonya_talk: [
    L('tonya', 'Pastor. Two things. One: your dumpster fence is down and my kids are using it as a fort.'),
    L('tonya', 'Two: half my residents are stationed on {post} and PCS every eighteen months. The other half think you\'re a gym.'),
    ME('We get that a lot. It\'s the bench press.'),
    L('tonya', 'I\'m not mad. I\'m asking: are you going to be neighbors or just a parking lot?'),
    { choice: [
      { label: 'Fix the fence this week. Personally.', goto: 'tonya_fence' },
      { label: 'Throw a block party for your residents.', goto: 'tonya_party' },
    ] },
  ],
  tonya_fence: [
    ME('Fence gets fixed this week. Me and a drill. And then a block party, because your kids clearly need a better fort.'),
    L('tonya', 'A pastor with a drill. Alright. I\'ll tell the residents you\'re real.', 'happy'),
    { effects: [{ set: 'tonyaResolved' }, { goodwill: 6 }] },
  ],
  tonya_party: [
    ME('We have a trailer that literally says BLOCK PARTY on it. Saturday. Hot dogs. Bounce house. Your lot or ours.'),
    L('tonya', 'Ours. So they know you came to them.', 'happy'),
    L('tonya', 'And fix the fence anyway.'),
    { effects: [{ set: 'tonyaResolved' }, { goodwill: 6 }] },
  ],
  tonya_after: [
    { if: (g) => g.isAlly('tonya'), then: 'tonya_ally' },
    L('tonya', 'Residents keep asking what time church is. I say "the sign is RIGHT THERE." They ask anyway.'),
  ],
  tonya_ally: [L('tonya', 'Four families from my building came Sunday. Two stayed for the coffee. That\'s how it starts, right?', 'happy')],
  ronnie_idle: [
    L('ronnie', 'Pastor. Truck\'s got a full tank and an empty bed. That\'s a ministry waiting to happen.'),
  ],
  ronnie_ally: [
    L('ronnie', 'Need something moved? Lifted? Vaguely threatened? The truck and I are at your service.', 'happy'),
  ],
  ronnie_neighbor_wait: [L('ronnie', 'Neighbors, huh. Talk to \'em first. Then come back. I got ideas and I got a truck.')],
  ronnie_service: [
    L('ronnie', 'Alright. They\'ve been heard. Now let\'s DO something. What\'s the move?'),
    { choice: [
      { label: 'Haul Gary\'s storm debris + build parking signs (25 energy)', goto: 'service_gary', disabled: (g) => g.state.energy < 25, disabledText: 'Need 25 energy for a day of hauling.' },
      { label: 'Rebuild Linda\'s back fence (25 energy)', goto: 'service_linda', disabled: (g) => g.state.energy < 25, disabledText: 'Need 25 energy for a day of fence work.' },
      { label: 'Block party at the apartments with the trailer (25 energy)', goto: 'service_tonya', disabled: (g) => g.state.energy < 25, disabledText: 'Need 25 energy for a party day.' },
      { label: 'Not today. Let me rest first.', goto: 'service_later' },
    ] },
  ],
  service_later: [L('ronnie', 'Rest up. Big things need a big Saturday. I\'ll keep the truck warm.')],
  service_gary: [
    { effects: [{ energy: -25 }] },
    N('Saturday. Ronnie\'s truck, Gary\'s debris pile from the April storm, and six volunteers who "just happened to be around."'),
    N('By noon: debris gone. By two: hand-painted PARKING THIS WAY signs, wired with tiny lights by a retired electrician who hummed the whole time.'),
    L('gary', 'Nobody\'s hauled that pile in three months. Nobody ASKED to.', 'happy'),
    { effects: [{ set: 'serviceDone' }, { ally: 'ronnie' }, { ally: 'gary' }, { ally: 'linda' }, { ally: 'tonya' }, { goodwill: 14 }, { morale: 6 }, { quest: ['neighbor', 'done'], outcome: ['neighbor', 'Cleared Gary\'s storm debris. Gary runs the parking team now. Linda and Tonya are friends.'] }] },
    ME('Love thy actual neighbor. Turns out it involves a truck.', 'happy'),
  ],
  service_linda: [
    { effects: [{ energy: -25 }] },
    N('Saturday. Linda\'s back fence has leaned since 2021. Ronnie has posts. Doug has a level. You have a shovel and a lot of enthusiasm.'),
    N('By four the fence is straight, painted, and Linda has fed everyone twice. She keeps saying "you didn\'t have to." Everyone keeps saying "we know."'),
    L('linda', 'The figurines are coming back out to the front window. As a sign of trust.', 'happy'),
    { effects: [{ set: 'serviceDone' }, { ally: 'ronnie' }, { ally: 'linda' }, { ally: 'gary' }, { ally: 'tonya' }, { goodwill: 14 }, { morale: 6 }, { quest: ['neighbor', 'done'], outcome: ['neighbor', 'Rebuilt Linda\'s fence. The figurines returned to the window. Gary and Tonya are friends.'] }] },
    ME('Love thy actual neighbor. Turns out it involves fence posts.', 'happy'),
  ],
  service_tonya: [
    { effects: [{ energy: -25 }] },
    N('Saturday. The BLOCK PARTY trailer rolls into the apartment lot behind Ronnie\'s truck. Hot dogs. A bounce house. Kyle DJs from a folding table. The website says you are "committed to blessing the community through serving food." That is the mission and also the menu.'),
    N('Forty kids. Twenty parents. Gary directs parking with his cones. Linda brings brownies. Mason wins the bench press contest (it is a broom).'),
    L('tonya', 'Half my building just met a church that didn\'t ask them for anything.', 'happy'),
    { effects: [{ set: 'serviceDone' }, { ally: 'ronnie' }, { ally: 'tonya' }, { ally: 'gary' }, { ally: 'linda' }, { goodwill: 16 }, { morale: 8 }, { quest: ['neighbor', 'done'], outcome: ['neighbor', 'Block party at the apartments. Forty kids. Gary directed parking. Linda brought brownies.'] }] },
    ME('Love thy actual neighbor. Turns out it involves a bounce house.', 'happy'),
  ],

  // ---------------------------------------------------------------- Q4: Campaign
  campaignIntro: [
    N('Your phone buzzes. It\'s {sage}.'),
    L('tim', 'Brother. You\'ve got a stain named Big Brown and a fund that can\'t buy a shed. Time for a capital campaign.'),
    L('tim', 'Three legs: a community EVENT, a GRANT, and a DONOR. Do all three. Any order. I\'m at Third Place if you need me. I\'m always at Third Place.'),
    ME('An event. The kind of event that makes a town show up. What would He-Man do?'),
    ME('...A wrestling show. In the warehouse. {event}.', 'happy'),
    N('New quest. Bev at City Hall handles event permits. Paulette at City Hall handles grants. Mr. Whitlock at the coffee shop has money and opinions.'),
    { effects: [{ quest: ['campaign', 'active', 0] }] },
  ],
  bev_idle: [L('bev', 'Take a number.'), N('You are the only person here.')],
  bev_end: [L('bev', 'A church that pulls permits on time. I\'ll remember you. I remember everyone.', 'smug')],
  bev_permit: [
    N('Bev has been at this counter since 1987. The counter was built around her.'),
    ME('Hi Bev. I need a permit for a wrestling show. At a church.'),
    L('bev', 'There is no form for that.', 'angry'),
    { encounter: 'bev', win: 'bev_win', lose: 'bev_lose' },
  ],
  bev_lose: [L('bev', 'Come back with the form.'), N('Which form? "The form." Rest up and try again.')],
  bev_win: [
    { effects: [{ set: 'eventPermit' }, { goodwill: 3 }] },
    L('bev', 'Special Event Permit, Form 12-C. Approved. Fire marshal says max 180 people and no pyrotechnics.'),
    ME('No pyrotechnics. Kyle will be devastated.'),
    N('Permit in hand. Talk to Big Ronnie by his truck to set up {event}.'),
  ],
  bev_done: [L('bev', 'Form 12-C. Approved. I told my sister. She\'s coming to the wrestling.', 'happy')],
  paulette_idle: [L('paulette', 'Community Development. Grants, mostly. Nobody finishes the application. Nobody.')],
  paulette_apply: [
    L('paulette', 'The Community Development Grant. {fund} in the bank and a warehouse church? Honey, you qualify. If you can finish the form.'),
    L('paulette', 'Forty-seven pages. Section 12(b) has ended marriages.'),
    ME('Let\'s do it.'),
    { encounter: 'form', win: 'grant_win', lose: 'grant_lose' },
  ],
  grant_lose: [L('paulette', 'Take a break, baby. The form isn\'t going anywhere. Neither is Form B, because it doesn\'t exist.')],
  grant_win: [
    { effects: [{ custom: (g) => { const bonus = g.state.goodwill >= 50 ? 3000 : 0; g.change('fund', BALANCE.grantAward + bonus); g.set('grantBonus', bonus); } }, { set: 'grantDone' }, { morale: 5 }] },
    L('paulette', 'Approved. Three weeks later, but approved. The check has a lot of zeros for a warehouse.', 'happy'),
    { if: (g) => (g.flag('grantBonus') as number) > 0, then: 'grant_bonus' },
    { goto: 'campaign_check' },
  ],
  grant_bonus: [
    L('paulette', 'And the committee added a community bonus. Apparently the neighbors wrote letters. Plural.', 'happy'),
    { goto: 'campaign_check' },
  ],
  paulette_done: [L('paulette', 'Framed your application. First one in eleven years with all 47 pages. Marcus signed page 31.', 'happy')],
  whitlock_idle: [L('whitlock', 'Three car washes and a boat. That\'s the whole bio. Ask me about the boat.')],
  whitlock_pitch: [
    N('Mr. Whitlock owns three car washes and a boat named "Liquid Assets."'),
    L('whitlock', 'Pastor. I\'ve been thinking about legacy.'),
    { encounter: 'whitlock', win: 'whitlock_win', lose: 'whitlock_lose' },
  ],
  whitlock_lose: [L('whitlock', 'Let me think on it.'), N('He orders a scone. Come back after some rest.')],
  whitlock_win: [
    L('whitlock', 'So. Here\'s my offer. Two versions.'),
    L('whitlock', `Version A: ${money(BALANCE.donorBig)}, and the restroom is "The Whitlock Family Restroom." Plaque and all. I think it's funny. My wife does not.`),
    L('whitlock', `Version B: ${money(BALANCE.donorFair)}, and a music room with Mama's name on it. Dorothy. And a real piano.`),
    { choice: [
      { label: `Take ${money(BALANCE.donorBig)}. Enjoy your restroom, sir.`, goto: 'donor_restroom' },
      { label: `${money(BALANCE.donorFair)} and the Dorothy Whitlock Music Room.`, goto: 'donor_music' },
    ] },
  ],
  donor_restroom: [
    { effects: [{ fund: BALANCE.donorBig }, { morale: -4 }, { set: 'donorDone' }, { setValue: ['donorChoice', 'restroom'] }] },
    L('whitlock', 'HA. Deal. The plaque\'s going to be brass.', 'happy'),
    ME('The Whitlock Family Restroom. Janet is going to have questions. Fourteen of them.', 'tired'),
    N('The elders are... fine with it. Mostly. Marcus made a tab.'),
    { goto: 'campaign_check' },
  ],
  donor_music: [
    { effects: [{ fund: BALANCE.donorFair }, { morale: 6 }, { ally: 'whitlock' }, { set: 'donorDone' }, { setValue: ['donorChoice', 'music'] }] },
    L('whitlock', 'Dorothy. With a window. And kids learning on it Wednesdays.', 'happy'),
    ME('Dorothy Whitlock Music Room. I\'ll put it in the plans myself.'),
    { goto: 'campaign_check' },
  ],
  whitlock_done: [
    { if: (g) => g.flag('donorChoice') === 'music', then: 'whitlock_done_music' },
    L('whitlock', 'I\'ve already designed the plaque. It has a little crown on it. For the throne. You get it.', 'smug'),
  ],
  whitlock_done_music: [L('whitlock', 'I found Mama\'s old hymnal. It\'s going in the music room. Don\'t make it weird.', 'happy')],
  ronnie_slam: [
    { if: (g) => g.has('slamPaid'), then: 'slam_start' },
    L('ronnie', 'A WRESTLING SHOW. In the church. Pastor, I have waited my whole life for a pastor to say this to me.', 'happy'),
    L('ronnie', `I know a guy in Oak Grove with a ring. Kyle's on sound. Gary's on parking. We need ${money(BALANCE.wrestlingCost)} for the ring rental, insurance, and 400 hot dogs.`),
    L('ronnie', 'And a headliner. Somebody big. Somebody with a beard. Somebody named... {nick}.'),
    { choice: [
      { label: `Let's do it (${money(BALANCE.wrestlingCost)}, 20 energy)`, goto: 'slam_pay', disabled: (g) => g.state.fund < BALANCE.wrestlingCost || g.state.energy < 20, disabledText: `Need ${money(BALANCE.wrestlingCost)} and 20 energy. Preach a Sunday, rest, then come back.` },
      { label: 'Not yet', goto: 'slam_wait' },
    ] },
  ],
  slam_wait: [L('ronnie', 'I\'ll be here. Stretching. Mentally.')],
  slam_pay: [
    { effects: [{ fund: -BALANCE.wrestlingCost }, { energy: -20 }, { set: 'slamPaid' }] },
    { goto: 'slam_start' },
  ],
  slam_start: [
    N('Saturday night. The chairs are gone. A ring sits in the sanctuary under Christmas lights. There are 180 people (the fire marshal counted).'),
    N('A masked figure waits in the ring. He is enormous. He is wearing a "DEACON" cape. It is obviously Ronnie.'),
    ME('"' + S.violence + '"', 'smug'),
    { encounter: 'masked', win: 'slam_win', lose: 'slam_lose' },
  ],
  slam_lose: [
    N('The show still raised money. Not as much. But the crowd wants a rematch, and rematches are free.'),
    { effects: [{ custom: (g) => { g.change('fund', 3000); g.change('goodwill', 3); } }] },
    L('ronnie', 'Rematch next Saturday. Same ring. Same mask. Come find me when you\'ve rested.'),
  ],
  slam_win: [
    { effects: [{ custom: (g) => {
      let raise = BALANCE.wrestlingBaseRaise + g.state.goodwill * 60;
      if (g.isAlly('linda')) raise += 1500;
      if (g.isAlly('gary')) raise += 800;
      g.set('slamRaise', raise);
      g.change('fund', raise);
      g.change('morale', 10);
      g.change('goodwill', 8);
      g.set('eventDone', true);
    } }] },
    N('{event} is over. The hot dogs are gone. Bev\'s sister bought a t-shirt. Linda did the wave four times.'),
    { if: (g) => g.isAlly('linda'), then: 'slam_linda' },
    { goto: 'slam_after' },
  ],
  slam_linda: [
    N('Linda sold brownies at the door. "For the building," she told every single person. She raised an extra $1,500 by herself.'),
    { goto: 'slam_after' },
  ],
  slam_after: [
    L('ronnie', 'Pastor. That was the best night of my LIFE. Can we do this every year?', 'happy'),
    ME('Every year. Annual. Put it on the sign.', 'happy'),
    { goto: 'campaign_check' },
  ],
  campaign_check: [
    { if: (g) => g.has('eventDone') && g.has('grantDone') && g.has('donorDone'), then: 'campaign_done' },
    { end: true },
  ],
  campaign_done: [
    N('Event, grant, donor. All three legs of the campaign are standing.'),
    ME('We might actually do this. Building fund: {fund}.', 'happy'),
    N('The elders want to meet. Head back to the church.'),
    { effects: [{ quest: ['campaign', 'done'], outcome: ['campaign', 'Wrestling night, a grant, and a donor. The fund is real now.'] }] },
  ],

  // ---------------------------------------------------------------- Q5: Elders
  eldersIntro: [
    L('doug', 'Pastor. Building committee. Now. I arranged the chairs in a circle.'),
    L('marcus', 'I have a spreadsheet.'),
    L('janet', 'I have carpet samples.'),
    ME('Three phases. Vision, money, carpet. Lord, be near.', 'tired'),
    N('New quest. Talk to Doug first, then Marcus, then Janet. Your past choices will help here.'),
    { effects: [{ quest: ['elders', 'active', 0] }] },
  ],
  doug_phase1: [
    N('PHASE 1: AGREE ON THE VISION'),
    { encounter: 'doug', win: 'doug_win', lose: 'doug_lose' },
  ],
  doug_lose: [L('doug', 'Let\'s table it.'), N('Rest and come back. Doug will still be here. Doug is ALWAYS here.')],
  doug_win: [
    { effects: [{ stage: ['elders', 1] }, { morale: 5 }] },
    L('doug', 'Vision\'s agreed. Now go survive Marcus. Take a snack.'),
  ],
  marcus_phase2: [
    N('PHASE 2: FINANCES AND THE CITY'),
    { if: (g) => g.has('grantDone') || g.isAlly('linda') || g.isAlly('harold'), then: 'marcus_boost' },
    { encounter: 'marcus', win: 'marcus_win', lose: 'marcus_lose' },
  ],
  marcus_boost: [
    N('Before the meeting, your allies weigh in:'),
    { if: (g) => g.has('grantDone'), then: 'marcus_boost_grant', else: 'marcus_boost2' },
  ],
  marcus_boost_grant: [
    L('marcus', 'The grant paperwork was... immaculate. I\'ve never seen a page 31 like it.', 'happy'),
    { effects: [{ custom: (g) => g.set('marcusStart', ((g.flag('marcusStart') as number) || 0) + 20) }] },
    { goto: 'marcus_boost2' },
  ],
  marcus_boost2: [
    { if: (g) => g.isAlly('linda'), then: 'marcus_boost_linda', else: 'marcus_boost3' },
  ],
  marcus_boost_linda: [
    L('linda', 'Zoning board already met. I brought brownies. You\'re "pre-approved in spirit."', 'smug'),
    { effects: [{ custom: (g) => g.set('marcusStart', ((g.flag('marcusStart') as number) || 0) + 15) }] },
    { goto: 'marcus_boost3' },
  ],
  marcus_boost3: [
    { if: (g) => g.isAlly('harold'), then: 'marcus_boost_harold', else: 'marcus_go' },
  ],
  marcus_boost_harold: [
    L('harold', 'The city clerk owed me a favor from 1994. Your permit path is clear. Do not ask about 1994.', 'smug'),
    { effects: [{ custom: (g) => g.set('marcusStart', ((g.flag('marcusStart') as number) || 0) + 10) }] },
    { goto: 'marcus_go' },
  ],
  marcus_go: [
    N('(Your allies gave you a head start on the resolution meter.)'),
    { encounter: 'marcus', win: 'marcus_win', lose: 'marcus_lose' },
  ],
  marcus_lose: [L('marcus', 'Let\'s revisit next quarter.'), N('Rest and come back. The spreadsheet will wait. It has all the time in the world.')],
  marcus_win: [
    { effects: [{ stage: ['elders', 2] }, { morale: 5 }] },
    L('marcus', 'Numbers work. City works. Now... Janet.'),
    L('marcus', 'Godspeed.'),
  ],
  janet_phase3: [
    N('PHASE 3: THE CARPET'),
    { if: (g) => g.isAlly('pruitt'), then: 'janet_pruitt' },
    { encounter: 'carpet', win: 'janet_win', lose: 'janet_lose' },
  ],
  janet_pruitt: [
    L('pruitt', 'I brought pound cake. And I told Janet burgundy shows coffee. She\'s already half convinced.', 'smug'),
    { effects: [{ custom: (g) => g.set('carpetStart', 15) }] },
    N('(Mrs. Pruitt gave you a head start.)'),
    { encounter: 'carpet', win: 'janet_win', lose: 'janet_lose' },
  ],
  janet_lose: [L('janet', 'Doodle poll incoming.'), N('Rest and come back. The carpet has waited 40 years.')],
  janet_win: [
    { effects: [{ stage: ['elders', 3] }, { morale: 8 }] },
    L('janet', 'The carpet is decided. I will take the color to my grave.'),
    L('doug', 'So. Buy the old chapel on Madison, or build on the lot by the apartments?'),
    L('marcus', `Buying needs ${money(BALANCE.buyCost)} down and a congregation that's all in (morale ${BALANCE.buyMoraleNeeded}+). Brenda's at the chapel.`),
    L('marcus', `Building needs ${money(BALANCE.buildCost)}, the whole town behind us (goodwill ${BALANCE.buildGoodwillNeeded}+), and a permit. Hank's at the lot.`),
    ME('Either way, we\'re out of the warehouse. Big Brown, your reign ends.', 'happy'),
    N('Decide: talk to Brenda at the chapel (north-east) to BUY, or Hank at the empty lot (south-east) to BUILD. Keep preaching if you need more money.'),
  ],
  elders_decide: [
    L('marcus', `BUY: ${money(BALANCE.buyCost)} + morale ${BALANCE.buyMoraleNeeded}. BUILD: ${money(BALANCE.buildCost)} + goodwill ${BALANCE.buildGoodwillNeeded} + a permit from Bev. Fund is {fund}.`),
    L('doug', 'Whatever you pick, I\'m carrying the heavy stuff.'),
  ],

  // ---------------------------------------------------------------- Endings
  brenda_idle: [
    L('brenda', 'Brenda, Clarksville Realty. This chapel\'s been for sale two years. Stained glass, hardwood, one ghost (friendly, allegedly).'),
    ME('"' + S.bestChurch + '" ...I could say that about a building like this.', 'happy'),
  ],
  brenda_buy: [
    L('brenda', '{chapel}. 1911. Stained glass, a bell that works, and a basement that only floods "spiritually."'),
    L('brenda', `The bank needs ${money(BALANCE.buyCost)} down and proof the congregation's behind it. Are they?`),
    { if: (g) => g.state.fund >= BALANCE.buyCost && g.state.morale >= BALANCE.buyMoraleNeeded, then: 'buy_ready', else: 'buy_notyet' },
  ],
  buy_notyet: [
    { if: (g) => g.state.fund < BALANCE.buyCost, then: 'buy_needmoney', else: 'buy_needmorale' },
  ],
  buy_needmoney: [
    L('brenda', `You're short on the down payment. Fund is {fund}; you need ${money(BALANCE.buyCost)}. Keep those Sundays coming, Pastor.`),
    ME('More Sundays. I can do Sundays. I\'m basically made of Sundays.', 'tired'),
  ],
  buy_needmorale: [
    L('brenda', `The bank wants the congregation all in. Morale needs to be ${BALANCE.buyMoraleNeeded}+. Preach, help people, finish what you started.`),
  ],
  buy_ready: [
    L('brenda', 'Then... congratulations. Sign here. And here. And initial the ghost clause.', 'happy'),
    ME('We\'re buying a church. An actual church. With a steeple.', 'shocked'),
    { choice: [
      { label: 'Sign it. We\'re buying.', goto: 'buy_go' },
      { label: 'Let me talk to Hank first.', goto: 'buy_hold' },
    ] },
  ],
  buy_hold: [L('brenda', 'Hank\'s a good man. His buildings don\'t have ghosts. His loss.')],
  buy_go: [
    { effects: [{ fund: -BALANCE.buyCost }, { quest: ['elders', 'done'], outcome: ['elders', `Bought ${PERSONAL.historicChurchName}. Stained glass. One ghost (friendly).`] }, { ending: 'buy' }] },
    N('You sign. Brenda hugs you. The bell rings, and nobody is pulling it.'),
  ],
  hank_idle: [
    L('hank', 'Hank. General contractor. This lot\'s been empty since the Blockbuster. I could put something beautiful here.'),
    ME('"' + S.ledWall + '"'),
    L('hank', 'A what wall?'),
  ],
  hank_build: [
    L('hank', `{campus}. Steel frame, big windows, a lobby with a coffee bar, and yes, a wall for your LED thing.`),
    L('hank', `I need ${money(BALANCE.buildCost)} to break ground, the neighbors behind it (goodwill ${BALANCE.buildGoodwillNeeded}+), and a building permit from Bev.`),
    { if: (g) => g.state.fund >= BALANCE.buildCost && g.state.goodwill >= BALANCE.buildGoodwillNeeded && g.has('eventPermit'), then: 'build_ready', else: 'build_notyet' },
  ],
  build_notyet: [
    { if: (g) => g.state.fund < BALANCE.buildCost, then: 'build_needmoney' },
    { if: (g) => g.state.goodwill < BALANCE.buildGoodwillNeeded, then: 'build_needgoodwill' },
    { goto: 'build_needpermit' },
  ],
  build_needmoney: [L('hank', `Short on cash. Fund's {fund}; I need ${money(BALANCE.buildCost)}. Concrete doesn't take IOUs.`)],
  build_needgoodwill: [L('hank', `The town has to want this. Goodwill's at ${'{goodwill}'}; I need ${BALANCE.buildGoodwillNeeded}. Help more neighbors.`)],
  build_needpermit: [L('hank', 'No permit, no shovel. Bev at City Hall. Ask for Form 12-C by name.')],
  build_ready: [
    L('hank', 'Then we break ground Monday. Doug\'s already got a hat.', 'happy'),
    ME('We\'re building a church. From nothing. On a Blockbuster.', 'shocked'),
    { choice: [
      { label: 'Break ground. We\'re building.', goto: 'build_go' },
      { label: 'Let me talk to Brenda first.', goto: 'build_hold' },
    ] },
  ],
  build_hold: [L('hank', 'Sure. Old buildings are nice. Old buildings also have "surprises."')],
  build_go: [
    { effects: [{ fund: -BALANCE.buildCost }, { quest: ['elders', 'done'], outcome: ['elders', `Broke ground on ${PERSONAL.newBuildName}. The LED wall is real.`] }, { ending: 'build' }] },
    N('You shake Hank\'s hand. Ronnie honks. Gary is already measuring for the LED wall.'),
  ],
  brenda_after: [L('brenda', 'Still my favorite closing. The ghost sends his regards.', 'happy')],
  hank_after: [L('hank', 'Best build of my career. Also the only one with a wrestling ring in the lobby.', 'happy')],

  // ---------------------------------------------------------------- Tim, the Wise Sage
  tim_first: [
    L('tim', 'Brother! Sit. I got you a black coffee the size of a fire extinguisher.'),
    ME('You know me too well, {sageShort}.'),
    L('tim', 'Bald guys stick together. Here\'s the thing: every church planter thinks the building is the goal. It\'s not. The building is the RECEIPT.'),
    L('tim', 'Your own sign says it: "{mission}" Notice "build a warehouse" isn\'t on there. {sendingChurch} didn\'t send you out for square footage.'),
    L('tim', 'Go love people. Listen more than you talk. When you\'re stuck in a hard conversation, LISTEN first, then do what the listening tells you.'),
    L('tim', 'And if you get really stuck, text me. In encounters, "Ask Wise Sage" is literally me. I answer fast. I don\'t sleep. Bald guys don\'t need to.', 'smug'),
    { effects: [{ set: 'metTim' }] },
  ],
  tim_idle: [
    L('tim', 'Third Place Coffee. It\'s called that because church is the first place, home is the second, and this is where pastors hide.'),
    ME('I\'m not hiding.'),
    L('tim', 'Your face is in a mug, brother.', 'smug'),
  ],
  tim_hvac: [
    L('tim', 'Dale? Don\'t sell him vision. Respect him and refill his cup. And remember: the volunteer option builds a relationship. The expensive one builds an invoice.'),
  ],
  tim_memorial: [
    L('tim', 'The bench thing. Listen to Mrs. Pruitt. Then find out the truth: your file cabinet and Harold both have pieces.'),
    L('tim', 'When the email thread comes for you, do NOT reply inside it. Set a boundary, take it offline. A subcommittee is how threads reproduce.'),
  ],
  tim_neighbor: [
    L('tim', 'Neighbors. Gary wants a job, not an apology. Linda wants an invitation, not a lecture. Tonya just wants to know if you\'re staying.'),
    L('tim', 'Then DO something with your hands. Ronnie has a truck. A truck is a sacrament, basically.'),
  ],
  tim_campaign: [
    L('tim', 'Bev has a Form 12-C; call a meeting with the fire marshal and ask for it by name. The grant form wants numbers, so bring Marcus. And Whitlock? Ask about his mother.'),
    L('tim', 'Also, a wrestling show is the single greatest fundraiser idea I have ever heard and I have heard "chili cook-off" four hundred times.', 'happy'),
  ],
  tim_elders: [
    L('tim', 'Doug needs a title. Marcus needs a meeting. Janet needs everyone to shut up about carpet in ninety seconds or less.'),
    L('tim', 'Then pick. Buy or build. Both are right. The wrong one is "keep waiting."'),
  ],
  tim_end: [
    L('tim', 'You did it, brother. The building\'s the receipt. Look around at who signed it.', 'happy'),
    ME('"' + S.bestChurch + '"', 'happy'),
    L('tim', 'C\'mon.', 'happy'),
  ],
  jess: [
    L('jess', 'Black coffee, size fire extinguisher? Six bucks. It restores 30 energy and my faith in humanity.'),
    { choice: [
      { label: 'Yes please ($6, +30 energy)', goto: 'jess_buy', disabled: (g) => g.state.fund < 6, disabledText: 'You do not have six dollars. Preach a Sunday.' },
      { label: 'Just visiting', goto: 'jess_no' },
    ] },
  ],
  jess_buy: [
    { effects: [{ fund: -6 }, { energy: 30 }, { sfx: 'heal' }] },
    L('jess', 'That\'s the good stuff. Tim tips in sermon illustrations, by the way. Cash is also fine.', 'happy'),
  ],
  jess_no: [L('jess', 'Dale\'s at the counter, Tim\'s by the window, Whitlock\'s telling someone about his boat. It\'s a normal Tuesday.')],
  cafeMenu: [N('Chalkboard: "Drip $3 / Big Drip $6 / Fire Extinguisher $6 (pastors only) / Scone: ask Whitlock, he bought them all."')],
  espresso: [N('An espresso machine named "Gerald." Gerald has a temper. Jess speaks Gerald.')],
  pastry: [N('Scones, croissants, one muffin labeled "Harold\'s, do not." Nobody has ever touched Harold\'s muffin.')],

  // ---------------------------------------------------------------- Town flavor
  mason: [
    L('mason', 'Is this a gym?'),
    ME('It\'s a church.'),
    L('mason', 'My uncle says you bench 300.'),
    ME('Your uncle is a wise man.', 'smug'),
    L('mason', 'Can I see?'),
    ME('Sunday. 10:30. Bring your uncle.'),
    { effects: [{ set: 'masonTalked' }, { goodwill: 1 }] },
  ],
  mason_again: [L('mason', 'I\'m a Harvest Big Kid. Fifth grade. Top of the food chain. I told everybody at school the pastor benches 300. Now they all want to come. Sorry?', 'happy')],
  dennis: [
    L('dennis', 'Pastor. Quick question. Is the building project in Revelation?'),
    ME('...Not specifically, Dennis.'),
    L('dennis', 'Because the warehouse has 12 fans. TWELVE.'),
    ME('It has 12 fans because I bought 12 fans.'),
    L('dennis', 'That\'s what THEY want you to think.', 'smug'),
    { effects: [{ set: 'dennisTalked' }] },
  ],
  dennis_again: [
    L('dennis', 'Quick question. Are we Southern Baptist?'),
    ME('We cooperate, Dennis.'),
    L('dennis', 'With WHO?', 'shocked'),
    ME('Everyone. That\'s the whole idea.'),
    L('dennis', 'Also I\'ve been watching the stain. It\'s shaped like Ohio. Ohio is significant. I\'ll explain Sunday.'),
  ],
  churchSign: [
    N('"{church}. {serviceTime}. Free coffee AND donuts." In smaller letters: "and AC (pending)."'),
    N('Under that, the whole mission in one breath: "{mission}"'),
    ME('"' + S.bestChurch + '"', 'smug'),
  ],
  churchStreetSign: [
    N('A sign by the road: "{church} - {address} - Everyone Welcome - Yes, This Building - No, Really."'),
    N('"{phone}. Please do not call during the sermon. Kyle will know."'),
    { if: (g) => g.state.day > 3, then: 'churchStreetSign_old' },
  ],
  churchStreetSign_old: [
    N('Someone has taped the old "{formerName}" banner to the back of the sign. It has been there since the rebrand. Nobody will admit to it.'),
    ME('We rebranded. Twice, if you count the font. The Comms team has FEELINGS about the font.', 'tired'),
  ],
  trailer: [
    N('A white trailer with BLOCK PARTY! painted on the side. It contains a bounce house, a grill, and a folding table that has hosted 900 hot dogs.'),
    ME('The most evangelistic object we own.'),
  ],
  trailer_missing: [N('The trailer is gone. There is a rectangle of cleaner asphalt where it used to be. Somewhere, a bounce house is unsupervised.')],
  truck: [
    N('A red pickup. Lift kit. Bumper sticker: "MY OTHER TRUCK IS ALSO A TRUCK." The bed is empty and ready.'),
    { if: (g) => g.isAlly('ronnie'), then: 'truck_ally' },
  ],
  truck_ally: [ME('A Volunteer With a Truck. Sing it with me: a surprising number of problems.', 'happy')],
  ac_unit: [N('The AC unit. It is silent in the way that a graveyard is silent. Something in it has shifted permanently.')],
  ac_fixed: [N('The AC unit hums. Dale left a business card taped to it: "CALL ME. NOT SUNDAY."')],
  aptSign: [N('"Cumberland Pines Apartments. Now Leasing. No Bounce Houses." The last part was added recently, in marker.')],
  garyMailbox: [N('Gary\'s mailbox. It has been hit twice and repainted three times. It flies a tiny flag that says "NO."')],
  garyDoor: [N('You knock. Through the door: "I\'M AT THE MAILBOX." He is, in fact, at the mailbox.')],
  lindaDoor: [N('A wreath. A doormat that says "HI, I\'M MAT." A window full of very small porcelain children, watching.')],
  pruittDoor: [N('A brass knocker shaped like a pineapple. The welcome mat says "Come and rest." It matters.')],
  coffeeSign: [N('"THIRD PLACE COFFEE. Pastors welcome. Sermons not." Someone crossed out "not."')],
  citySign: [N('"{town} CITY HALL. Permits, Licenses, Grants. Hours: 8-4, closed 12-1, also closed 1-2 (Bev)."')],
  chapelDoor: [
    N('Heavy oak doors. Through the glass: pews, dust, light through stained glass. It smells like 1911 and lemon polish.'),
    ME('"' + S.bestChurch + '" I mean, if we had THIS...', 'happy'),
  ],
  forSale: [N('"FOR SALE. Historic Chapel. Brenda, Clarksville Realty. Serious inquiries. Also unserious ones, honestly, it\'s been two years."')],
  lotSign: [
    N('"FUTURE HOME OF ________." Under it, in marker: "a Blockbuster (again)?" and "please a church" and "a Whataburger."'),
    ME('I\'d take the Whataburger too, honestly.'),
  ],
  parkBench: [
    N('A park bench. Nobody needs anything from you here.'),
    { choice: [
      { label: 'Sit for a minute (+10 energy)', goto: 'parkBench_sit' },
      { label: 'Keep moving', goto: 'parkBench_no' },
    ] },
  ],
  parkBench_sit: [
    { effects: [{ energy: 10, set: 'parkBenchToday', sfx: 'heal' }] },
    ME('...Okay. Okay. That was good. Back to it.', 'happy'),
  ],
  parkBench_no: [ME('Sunday\'s coming.')],
  parkBench_done: [N('You already sat here today. The bench is not a couch. The bench has limits.')],
  townSign: [N('"Welcome to {town}, {stateName}. Population: some. Home of the {churchShort} Wrestling Championship (pending)."'.replace('{stateName}', PERSONAL.stateName))],
  bulletin: [N('Flyers: "Lost cat (found, kept)", "Zoning Board Mtg Tues", "Chili Cook-Off (23rd annual)", and a wanted poster for a raccoon.')],
  mayor: [N('A portrait of the mayor. He is smiling. He has been smiling in this exact frame since 1994. Harold knows why.')],
  takeNumber: [
    N('A number dispenser. You take one. It says 41.'),
    N('The sign says NOW SERVING: 12. It has said 12 for a long time.'),
  ],
  grantDeskSign: [N('"COMMUNITY DEVELOPMENT GRANTS. Ask for Paulette. Do NOT ask about Form B."')],

  reyes: [
    L('reyes', 'Pastor. Specialist Reyes. Stationed on {post}. Found y\'all at a block party. Free hot dogs, no strings. Suspicious.'),
    ME('The strings are Jesus.'),
    L('reyes', 'Yeah, I figured that out around the second hot dog. My sergeant said "go to church." He meant it as a threat. Joke\'s on him.', 'happy'),
    L('reyes', 'PCS orders come in eighteen months. Till then, I\'m on the tech team. Kyle gave me a cable to hold. I hold it well.'),
    { effects: [{ set: 'reyesTalked' }, { goodwill: 2 }, { morale: 2 }] },
  ],
  reyes_again: [L('reyes', 'Blackhawks at 9:45 every Sunday. That\'s not noise, Pastor. That\'s the opening hymn.', 'smug')],
  welcomeTable: [
    N('The welcome table. Connect cards, a bowl of mints from the {formerName} era, and a sign-up sheet for the next block party with 41 names on it.'),
    N('A laminated card reads: "{mission}" Somebody has added, in pen, "and fix the AC."'),
  ],
  kidsBoard: [
    N('HARVEST KIDS CHECK-IN. Four doors, four signs: Harvest Babees (0-17 months), Harvest Tots, Harvest Little Kids, Harvest Big Kids.'),
    N('Under "Big Kids" someone has written "aka the Mason problem." Under that, in different handwriting: "I can read this."'),
  ],
  ev_blackhawks: [
    N('Sunday, 10:52 AM. Two Blackhawks from {post} come over low, right at the closing point.'),
    N('Nobody hears the closing point. Everybody loves it. Specialist Reyes salutes the ceiling. Dennis takes it as a sign.'),
    ME('I\'ll say the closing point again next week. It was good. Trust me.', 'happy'),
    { effects: [{ morale: 3 }] },
  ],

  // ---------------------------------------------------------------- Random events
  ev_roofLeak: [
    N('Morning. It rained. The stain has a friend now. Water on the sound booth.'),
    { if: (g) => g.isAlly('dale'), then: 'ev_roofLeak_dale' },
    { effects: [{ fund: -450 }, { morale: -2 }] },
    N('A roofer patches it. $450. He says "for now" in a way that lingers.'),
    ME('{curse} {oops} For now. Everything in this building is "for now."', 'tired'),
  ],
  ev_roofLeak_dale: [
    N('Dale shows up with a tarp, a ladder, and a story about a bass the size of a toddler. He patches it for free. He tells the story twice.'),
    { effects: [{ morale: 2 }] },
    L('dale', 'Not a roofer. But I know a leak when I see one.', 'happy'),
  ],
  ev_soundboard: [
    N('Kyle calls. Channel 7 on the soundboard has died. He sounds like he is at a funeral. He is at the soundboard.'),
    { choice: [
      { label: 'Buy a replacement board ($600)', goto: 'ev_soundboard_buy', disabled: (g) => g.state.fund < 600, disabledText: 'Not enough money. Let Kyle fix it.' },
      { label: 'Let Kyle rebuild it (Kyle needs a day)', goto: 'ev_soundboard_kyle' },
    ] },
  ],
  ev_soundboard_buy: [
    { effects: [{ fund: -600 }, { morale: 3 }] },
    L('kyle', 'A NEW board. With channels. That WORK. Pastor, I could kiss you. I won\'t.', 'happy'),
  ],
  ev_soundboard_kyle: [
    { effects: [{ set: 'soundboardBroken' }, { morale: -1 }] },
    L('kyle', 'I\'ll rebuild it. Soldering iron. YouTube. Faith. Sunday will be a little... hissy.'),
    { effects: [{ custom: (g) => { g.set('soundboardBroken', false); } }] },
    N('(By the next morning, Kyle has fixed it. He did not sleep. He says he did.)'),
  ],
  ev_trailer: [
    N('The BLOCK PARTY trailer is GONE. There is a clean rectangle of asphalt where it used to be.'),
    { if: (g) => g.isAlly('tonya'), then: 'ev_trailer_tonya' },
    { effects: [{ set: 'trailerMissing' }, { fund: -200 }] },
    ME('{curse} Not the TRAILER. {oops}', 'shocked'),
    N('Two days later the police find it behind the apartments. Somebody "borrowed" it for a birthday. The tow fee is $200. The bounce house is fine.'),
    { effects: [{ custom: (g) => g.set('trailerMissing', false) }] },
  ],
  ev_trailer_tonya: [
    L('tonya', 'Pastor. Your trailer is behind building C. A kid\'s birthday. They were going to bring it back. I made them bring it back NOW.', 'smug'),
    { effects: [{ goodwill: 4 }] },
    ME('Best neighbor. Best. Neighbor.', 'happy'),
  ],
  ev_repairBill: [
    N('The water heater has died. In its sleep. Peacefully. Expensively.'),
    { effects: [{ fund: -700 }] },
    ME('{curse} {oops} $700. Cold hands for a week. Marcus is going to make a tab.', 'tired'),
  ],
  ev_gift: [
    N('An envelope under the office door. No name. Inside: $1,500 in cash and a {team} sticker.'),
    { effects: [{ fund: 1500 }, { morale: 3 }] },
    ME('I have a suspect. I have several suspects. I love all of them.', 'happy'),
  ],
  ev_volunteer: [
    N('A retired plumber named Walt shows up Tuesday. "Heard you had a bathroom." He fixes the bathroom. He fixes the OTHER bathroom. He leaves.'),
    { effects: [{ morale: 6 }] },
    ME('Walt. We didn\'t know we needed you. That\'s how it works.', 'happy'),
  ],
  ev_neighborHelp: [
    N('Gary, Linda and two guys from the apartments show up Saturday and paint the parking lines. Nobody asked. Gary brought cones.'),
    { effects: [{ goodwill: 6 }, { morale: 3 }] },
    ME('The lines are straight. The lines have never been straight.', 'shocked'),
  ],
  ev_ledWall: [
    N('You find an LED wall on Facebook Marketplace. Used. From a nightclub. "Some pixels dead. Smells like fog machine."'),
    ME('"' + S.ledWall + '"', 'happy'),
    N('You look at the listing for twenty minutes. You close the tab. You reopen the tab. You close it. You save it. For later. For the building.'),
    { effects: [{ energy: -5 }, { morale: 2 }] },
  ],
  ev_fanBreaker: [
    N('Sunday, 10:38 AM. Twelve box fans. One breaker. The breaker loses.'),
    ME('{curse}', 'shocked'),
    N('(He said it into a live microphone. The livestream caught it. Four viewers. One was his mother.)'),
    N('Total darkness. Somebody says "well." Somebody else starts singing, and the whole room joins in, in the dark, with no fans.'),
    N('Afterward, Dale comes by unprompted and fixes the compressor. He charges $900. He says "I told you" only once.'),
    { effects: [{ fund: -900 }, { set: 'hvacFixed' }, { morale: 4 }] },
    ME('The AC is fixed. The fans are in the trailer. The dark-singing thing... people keep talking about it. Huh.', 'happy'),
  ],
  ev_pruittCake: [
    L('pruitt', 'Pound cake. Two of them. One for the elders, one for you. Don\'t share yours.', 'happy'),
    { effects: [{ energy: 15 }, { morale: 2 }] },
    ME('Mrs. Pruitt, you are a means of grace.', 'happy'),
  ],
};

// =====================================================================
// ENDING
// =====================================================================
export interface EndingLine { who?: string; mood?: Mood; text: string }

export function ENDING_SCRIPT(kind: 'buy' | 'build', g: Game): EndingLine[] {
  const lines: EndingLine[] = [];
  if (kind === 'buy') {
    lines.push({ text: `${PERSONAL.historicChurchName}. Sunday morning. Light through stained glass lands on every single chair. They are pews now. Janet cried about the pews.` });
    lines.push({ who: 'erik', mood: 'happy', text: 'It has a bell. We have a BELL. Kyle wants to mic the bell.' });
    lines.push({ who: 'kyle', mood: 'happy', text: 'I have a booth with a door. Channel 7 lives. Also yes I mic\'d the bell.' });
  } else {
    lines.push({ text: `${PERSONAL.newBuildName}. Sunday morning. Big windows, a coffee bar in the lobby, and on the front wall, glowing like a promise kept: an LED wall.` });
    lines.push({ who: 'erik', mood: 'happy', text: `"${S.ledWall}" I said it. Look at it. LOOK AT IT.` });
    lines.push({ who: 'gary', mood: 'smug', text: 'I wired it. Don\'t tell the inspector. Do tell the inspector it\'s beautiful.' });
  }
  lines.push({ who: 'tim', mood: 'happy', text: 'Told you. The building is the receipt. Now look around at who signed it.' });
  lines.push({ who: 'doug', mood: 'happy', text: 'Head of the build team. Moved every chair in here myself. Bench 300. No questions.' });
  lines.push({ who: 'marcus', mood: 'happy', text: 'One tab. "Actually Happening." I\'ve never been happier about a spreadsheet.' });
  lines.push({ who: 'janet', mood: 'smug', text: 'The carpet is perfect. I will never tell anyone what color it is. Look down. Then look up. Then forget.' });
  lines.push({ who: 'ronnie', mood: 'happy', text: 'Truck\'s outside. Always will be. Second annual ' + PERSONAL.wrestlingEventName + ' is in the lobby next month.' });
  if (g.isAlly('pruitt')) lines.push({ who: 'pruitt', mood: 'happy', text: 'Second row. Every Sunday. The bench came with us. "Come and rest." We did.' });
  if (g.isAlly('harold')) lines.push({ who: 'harold', mood: 'happy', text: 'I have not replied-all in eight months. I\'m told there\'s a chip for that.' });
  if (g.isAlly('linda')) lines.push({ who: 'linda', mood: 'happy', text: 'I\'m on the welcome team. Nobody has ever been welcomed this thoroughly.' });
  if (g.isAlly('tonya')) lines.push({ who: 'tonya', mood: 'happy', text: 'Eleven families from my building. ELEVEN. And the trailer stays in MY lot now, thank you.' });
  if (g.isAlly('whitlock')) lines.push({ who: 'whitlock', mood: 'happy', text: 'The Dorothy Whitlock Music Room. Kids on Wednesdays. Mama would\'ve hated the noise. She\'d have loved it.' });
  if (g.flag('donorChoice') === 'restroom') lines.push({ who: 'whitlock', mood: 'smug', text: 'The Whitlock Family Restroom. Brass plaque. Little crown. Worth every penny. Ask anyone. Don\'t.' });
  if (g.isAlly('dale')) lines.push({ who: 'dale', mood: 'happy', text: 'AC works. I checked. I check every Tuesday. Bass are biting, by the way.' });
  lines.push({ who: 'tasha', mood: 'happy', text: 'Four kids rooms with DOORS. Babees, Tots, Little Kids, Big Kids. Bread is head volunteer now.' });
  if (g.has('reyesTalked')) lines.push({ who: 'reyes', mood: 'happy', text: 'Orders got extended. I told the Army it was the coffee. It was not the coffee.' });
  lines.push({ who: 'brayden', mood: 'happy', text: 'Slides are typo-free. Mostly. "Jesus Lovs You" is on a t-shirt now. It\'s a vibe.' });
  lines.push({ who: 'erik', mood: 'neutral', text: 'The building is the receipt. Everyone in this room is the reason. ' + PERSONAL.churchName + '. ' + PERSONAL.townName + '.' });
  lines.push({ who: 'erik', mood: 'happy', text: `"${S.bestChurch}"` });
  lines.push({ who: 'tim', mood: 'happy', text: 'C\'mon.' });
  return lines;
}

export function ENDING_CREDITS(kind: 'buy' | 'build', g: Game): { text: string; color?: string; small?: boolean }[] {
  const s = g.state;
  const out: { text: string; color?: string; small?: boolean }[] = [];
  out.push({ text: PERSONAL.gameTitle.toUpperCase(), color: '#ffd27f' });
  out.push({ text: PERSONAL.gameSubtitle.toUpperCase(), small: true });
  out.push({ text: '' });
  out.push({ text: kind === 'buy' ? 'ENDING: THE CHAPEL' : 'ENDING: THE CAMPUS', color: '#7ce0a0' });
  out.push({ text: kind === 'buy' ? PERSONAL.historicChurchName : PERSONAL.newBuildName, small: true });
  out.push({ text: '' });
  out.push({ text: 'HOW IT WENT', color: '#ffd27f' });
  for (const q of ['hvac', 'memorial', 'neighbor', 'campaign', 'elders']) {
    const qs = g.quest(q);
    if (qs.outcome) out.push({ text: qs.outcome, small: true });
  }
  out.push({ text: '' });
  out.push({ text: 'PEOPLE WHO SHOWED UP', color: '#ffd27f' });
  const allyNames: Record<string, string> = { ronnie: 'Big Ronnie & the Truck', dale: 'Dale (HVAC & Bass)', pruitt: 'Mrs. Pruitt (2nd row)', harold: 'Harold (reformed replier)', gary: 'Gary (cones)', linda: 'Linda (brownies)', tonya: 'Tonya (Cumberland Pines)', whitlock: 'Mr. Whitlock (& Dorothy)' };
  for (const a of s.allies) out.push({ text: allyNames[a] ?? a, small: true });
  out.push({ text: 'Kyle, Brayden (Bread), Tasha, Doug, Marcus, Janet', small: true });
  out.push({ text: `and ${PERSONAL.sageName}`, small: true });
  out.push({ text: '' });
  out.push({ text: 'BY THE NUMBERS', color: '#ffd27f' });
  out.push({ text: `Days: ${s.day}   Sundays preached: ${(s.flags.services as number) ?? 0}`, small: true });
  out.push({ text: `Fund left over: ${money(s.fund)}`, small: true });
  out.push({ text: `Goodwill ${s.goodwill}   Morale ${s.morale}`, small: true });
  out.push({ text: `Big Brown (the stain): defeated`, small: true });
  out.push({ text: '' });
  out.push({ text: 'STARRING', color: '#ffd27f' });
  out.push({ text: `${PERSONAL.heroNickname} as himself`, small: true });
  out.push({ text: `${PERSONAL.churchFullName} as itself`, small: true });
  out.push({ text: `${PERSONAL.address} - ${PERSONAL.serviceTime}`, small: true });
  out.push({ text: `Sent out by ${PERSONAL.sendingChurch}`, small: true });
  out.push({ text: PERSONAL.mission, small: true });
  out.push({ text: 'The Warehouse as "The Warehouse"', small: true });
  out.push({ text: '' });
  out.push({ text: `Made with love (and a roast) for ${PERSONAL.heroName}`, color: '#ff7a7a' });
  out.push({ text: `by ${PERSONAL.sageName}`, small: true });
  out.push({ text: '' });
  out.push({ text: `"${S.bestChurch}"`, small: true });
  out.push({ text: '' });
  out.push({ text: 'Original pixel art, music, and story.', small: true });
  out.push({ text: 'No real committees were harmed.', small: true });
  return out;
}
