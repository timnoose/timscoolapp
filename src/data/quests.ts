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
