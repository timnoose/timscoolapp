/**
 * Quest journal text. Objectives are functions of game state so the journal always
 * shows the next concrete thing to do.
 */
import type { Game } from '../engine/state';
import { PERSONAL } from '../config/personal';
import { BALANCE } from './balance';
import { money } from '../engine/format';

export interface QuestDef {
  id: string;
  order: number;
  title: string;
  description: string;
  showWhenInactive?: boolean;
  objective: (g: Game) => string;
}

export const QUESTS: Record<string, QuestDef> = {
  intro: {
    id: 'intro', order: 0, title: 'Sunday Is Coming',
    description: 'Get out of the office and find out what is on fire today.',
    objective: () => 'Leave the office and talk to Kyle at the sound booth.',
  },
  hvac: {
    id: 'hvac', order: 1, title: 'The HVAC Has Left the Chat',
    description: 'The air conditioning died before Sunday. Find Dale the HVAC guy and pick a fix.',
    objective: (g) => {
      const st = g.questStage('hvac');
      if (st === 0) return 'Find Dale the HVAC guy. Kyle says he lives at Third Place Coffee.';
      if (st === 1) return 'Dale is talking. Choose a repair plan.';
      if (st === 2) return 'Go back to the church and check the thermostat.';
      return 'Done.';
    },
  },
  memorial: {
    id: 'memorial', order: 2, title: 'A Grave Misunderstanding',
    description: 'Former members are upset that the memorial bench was moved. Find out why, then make it right.',
    objective: (g) => {
      const st = g.questStage('memorial');
      if (st === 0) return 'Visit Mrs. Pruitt at her house (north-west) and listen.';
      if (st === 1) return 'Find out who moved the bench: check the file cabinet in your office and talk to Harold at the coffee shop.';
      if (st === 2) return 'Go back to Mrs. Pruitt with what you learned.';
      if (st === 3) return 'Deal with the Reply-All email thread. Then choose a resolution with Mrs. Pruitt.';
      return 'Done.';
    },
  },
  neighbor: {
    id: 'neighbor', order: 3, title: 'Love Thy Actual Neighbor',
    description: 'Gary (parking), Linda (noise) and Monique (apartments) have opinions. Win them over.',
    objective: (g) => {
      const parts: string[] = [];
      if (!g.has('garyResolved')) parts.push('Gary (west, by his mailbox)');
      if (!g.has('lindaResolved')) parts.push('Linda (east of the lot)');
      if (!g.has('tonyaResolved')) parts.push('Monique (apartments)');
      if (parts.length) return 'Talk with the neighbors: ' + parts.join(', ') + '.';
      if (!g.has('serviceDone')) return 'Do an act of service: talk to Big Ronnie by his truck.';
      return 'Done.';
    },
  },
  campaign: {
    id: 'campaign', order: 4, title: 'Capital Campaign of Destiny',
    description: 'Raise serious money three ways: a community event, a grant, and a donor.',
    objective: (g) => {
      const parts: string[] = [];
      if (!g.has('eventDone')) parts.push(g.has('eventPermit') ? `hold ${PERSONAL.wrestlingEventName} (talk to Ronnie)` : 'get an event permit from Bev at City Hall');
      if (!g.has('grantDone')) parts.push('apply for the grant (Paulette, City Hall)');
      if (!g.has('donorDone')) parts.push('talk to Mr. Whitlock at the coffee shop');
      if (!parts.length) return 'Done. Report to the elders at the church.';
      return 'Fundraising: ' + parts.join('; ') + '.';
    },
  },
  elders: {
    id: 'elders', order: 5, title: 'The Elders aka The Building Committee',
    description: 'Three-phase meeting: vision, money & city, and the carpet.',
    objective: (g) => {
      const st = g.questStage('elders');
      if (st === 0) return 'Talk to Elder Doug at the church to open the meeting.';
      if (st === 1) return 'Phase 2: talk to Elder Marcus (money and the city).';
      if (st === 2) return 'Phase 3: talk to Elder Janet. Survive the carpet.';
      if (st === 3) return `Decide: BUY (${money(BALANCE.buyCost)}, morale ${BALANCE.buyMoraleNeeded}+) via Brenda at the chapel, or BUILD (${money(BALANCE.buildCost)}, goodwill ${BALANCE.buildGoodwillNeeded}+, permit) via Hank at the lot.`;
      return 'Done.';
    },
  },
};

export function currentObjective(g: Game): string {
  const order = Object.values(QUESTS).sort((a, b) => a.order - b.order);
  const active = order.filter((q) => g.questIs(q.id, 'active'));
  if (active.length) return active.map((q) => q.objective(g)).join('  |  ');
  if (order.every((q) => g.questIs(q.id, 'done'))) return 'Everything is done. Enjoy the building.';
  if (g.questIs('intro', 'inactive')) return 'Check your desk, then leave the office.';
  return 'Explore. Talk to people. Preach on Sundays.';
}

export const RESOURCE_HELP = {
  fund: 'Money for the building. Earned from Sunday services, the campaign and gifts. Spent on repairs and the big decision.',
  goodwill: 'How the town feels about you. Unlocks help from neighbors and the city. Needed to BUILD.',
  morale: 'How the congregation feels. Raises Sunday offerings and elder support. Needed to BUY.',
  energy: 'Your gas tank. Encounters and preaching use it. Rest on the office couch or drink coffee to recover.',
};

export const ALLY_NOTES: Record<string, string> = {
  ronnie: 'Owns a truck. A Volunteer With a Truck solves a surprising number of problems, including some encounters.',
  dale: 'HVAC guy. Now answers the phone on the first ring. Roof leaks cost less.',
  pruitt: 'Former member turned friend. Brings pound cake to meetings. The elders listen to her.',
  harold: 'Deacon Emeritus. Has been talked off Reply All. Knows everyone on the zoning board.',
  gary: 'Retired electrician next door. Parking peace achieved. Knows how to wire an LED wall.',
  linda: 'Former zoning board member. Noise treaty signed. Vouches for you at City Hall.',
  tonya: 'Apartment manager (Monique). Sends residents your way. Found the trailer.',
  whitlock: 'Donor with opinions about restrooms. Writes checks.',
  tim: 'Church planting sage. Bald, wise, texts back instantly.',
  kyle: 'Sound guy. The board only works if he is looking at it.',
  hannah: 'Director of Operations. Has a binder for the binders. Form 12-C is already filled out.',
  richard: 'Care Pastor and woodworker. Born on post. Builds benches, counters, and peace.',
  eli: 'Discipleship Pastor and Apache pilot. Go Vols. Forgive him.',
};

/** A place in the world the player should head to next (drives the on-screen marker). */
export interface QuestTarget { map: string; x: number; y: number; label: string }

const canBuy = (g: Game) => g.state.fund >= BALANCE.buyCost && g.state.morale >= BALANCE.buyMoraleNeeded;
const canBuild = (g: Game) => g.state.fund >= BALANCE.buildCost && g.state.goodwill >= BALANCE.buildGoodwillNeeded;
/** Sunday loop: preach if you can, otherwise rest on the couch so Sunday comes around. */
const sundayLoop = (g: Game): QuestTarget => (g.has('preachedToday')
  ? { map: 'office', x: 1, y: 4, label: 'Rest (couch)' }
  : { map: 'church', x: 12, y: 2, label: 'Preach' });

export function questTarget(g: Game): QuestTarget | null {
  if (g.questIs('intro', 'inactive')) return g.has('introDone') ? { map: 'office', x: 4, y: 2, label: 'Desk' } : null;
  if (g.questIs('intro', 'active')) return { map: 'church', x: 13, y: 16, label: 'Kyle' };
  if (g.questIs('hvac', 'active')) {
    return g.questStage('hvac') >= 2 ? { map: 'church', x: 22, y: 1, label: 'Thermostat' } : { map: 'coffee', x: 8, y: 3, label: 'Dale' };
  }
  if (g.questIs('memorial', 'active')) {
    const st = g.questStage('memorial');
    if (st === 1) {
      if (!g.has('minutesRead')) return { map: 'office', x: 7, y: 1, label: 'File cabinet' };
      if (!g.has('haroldTalked')) return { map: 'coffee', x: 2, y: 9, label: 'Harold' };
    }
    return { map: 'town', x: 6, y: 13, label: 'Mrs. Pruitt' };
  }
  if (g.questIs('neighbor', 'active')) {
    if (!g.has('garyResolved')) return { map: 'town', x: 7, y: 27, label: 'Gary' };
    if (!g.has('lindaResolved')) return { map: 'town', x: 40, y: 34, label: 'Linda' };
    if (!g.has('tonyaResolved')) return { map: 'town', x: 39, y: 26, label: 'Monique' };
    return { map: 'town', x: 26, y: 31, label: 'Big Ronnie' };
  }
  if (g.questIs('campaign', 'active')) {
    if (!g.has('eventDone')) return g.has('eventPermit') ? { map: 'town', x: 26, y: 31, label: 'Ronnie (event)' } : { map: 'cityhall', x: 9, y: 1, label: 'Bev (permit)' };
    if (!g.has('grantDone')) return { map: 'cityhall', x: 14, y: 2, label: 'Paulette (grant)' };
    if (!g.has('donorDone')) return { map: 'coffee', x: 12, y: 8, label: 'Mr. Whitlock' };
    return { map: 'church', x: 10, y: 4, label: 'The elders' };
  }
  if (g.questIs('elders', 'active')) {
    const st = g.questStage('elders');
    if (st === 0) return { map: 'church', x: 10, y: 4, label: 'Elder Doug' };
    if (st === 1) return { map: 'church', x: 14, y: 4, label: 'Elder Marcus' };
    if (st === 2) return { map: 'church', x: 12, y: 6, label: 'Elder Janet' };
    if (canBuy(g)) return { map: 'town', x: 44, y: 10, label: 'Brenda (BUY)' };
    if (canBuild(g)) return { map: 'town', x: 40, y: 36, label: 'Hank (BUILD)' };
    return sundayLoop(g);
  }
  // between quests the next story beat starts when you step outside / into the church
  if (g.questIs('hvac', 'done') && g.questIs('memorial', 'inactive')) return { map: 'town', x: 20, y: 28, label: 'Outside' };
  if (g.questIs('memorial', 'done') && g.questIs('neighbor', 'inactive')) return { map: 'town', x: 20, y: 28, label: 'Outside' };
  if (g.questIs('neighbor', 'done') && g.questIs('campaign', 'inactive')) return { map: 'town', x: 20, y: 28, label: 'Outside' };
  if (g.questIs('campaign', 'done') && g.questIs('elders', 'inactive')) return { map: 'church', x: 22, y: 17, label: 'Harvest' };
  return null;
}

/** Short names for the marker label when it points at a door. */
export const MAP_SHORT: Record<string, string> = { town: 'Outside', church: 'Harvest', office: 'Office', coffee: 'Coffee shop', cityhall: 'City Hall' };
