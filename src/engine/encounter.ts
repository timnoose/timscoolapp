/**
 * Social encounter logic (Pokemon-style menu battle, no violence).
 * Pure functions so the UI scene stays thin and balance can be unit-tested.
 */
import { BALANCE } from '../data/balance';

export type MoveId = 'listen' | 'vision' | 'coffee' | 'volunteer' | 'boundary' | 'sage' | 'meeting';
export type Effectiveness = 'super' | 'good' | 'normal' | 'weak' | 'backfire';

export interface OpponentMove {
  id: string;
  name: string;
  text: string;            // narration when used
  resolution?: number;     // change to resolution meter (negative = setback)
  energy?: number;         // change to player energy
  morale?: number;         // change to congregation morale (applied at end)
  resist?: number;         // adds resistance turns
  delay?: number;          // adds delay turns (player gains halved)
}

export interface EncounterDef {
  id: string;
  name: string;            // opponent display name
  cast: string;            // portrait id ('thread', 'form' for non-humans)
  title: string;           // "Concern:" one-liner shown above meter
  intro: string[];         // opening narration lines
  clue: string;            // shown after Listen (the tell)
  sageAdvice: string;      // what Wise Sage Tim says
  effectiveness: Partial<Record<MoveId, Effectiveness>>;
  afterListen?: Partial<Record<MoveId, Effectiveness>>; // effectiveness upgrades once you've listened
  moves: OpponentMove[];
  target: number;          // resolution needed (usually 100)
  startResolution?: number;
  flavor?: Partial<Record<MoveId, string>>; // custom reaction text per move
  winText: string[];
  loseText: string[];
  music?: string;
  truckSolves?: boolean;   // "Volunteer With a Truck" instantly resolves
  moveDisabled?: Partial<Record<MoveId, string>>; // reason a move is unavailable
}

export interface EncounterState {
  def: EncounterDef;
  resolution: number;
  energy: number;
  listened: boolean;
  sageUsed: boolean;
  coffeeUsed: number;
  resistTurns: number;
  delayTurns: number;
  turn: number;
  log: string[];
  moraleDelta: number;
  over: 'win' | 'lose' | null;
  lastEffect?: Effectiveness;
  volunteerUsed: boolean;
  hasTruck: boolean;
  sageName: string;
}

export const MOVE_INFO: Record<MoveId, { name: string; short: string; desc: string }> = {
  listen: { name: 'Listen', short: 'Listen', desc: 'Learn what they actually need. Reveals the best approach.' },
  vision: { name: 'Explain Vision', short: 'Vision', desc: 'Cast the vision. Strong once you know what they care about.' },
  coffee: { name: 'Offer Coffee', short: 'Coffee', desc: 'Everyone softens over coffee. Restores a little energy.' },
  volunteer: { name: 'Recruit Volunteer', short: 'Volunteer', desc: 'Many hands. Better with a Volunteer With a Truck.' },
  boundary: { name: 'Set a Boundary', short: 'Boundary', desc: 'Kind but firm. Great vs. email chains, bad vs. grief.' },
  sage: { name: 'Ask Wise Sage', short: 'Sage', desc: 'Phone a friend. Reveals the weakness. Once per talk.' },
  meeting: { name: 'Call a Meeting', short: 'Meeting', desc: 'Cuts through subcommittees and resistance. Costs energy.' },
};

export const BASE_POWER: Record<MoveId, number> = {
  listen: 8, vision: 22, coffee: 14, volunteer: 18, boundary: 20, sage: 10, meeting: 16,
};

const EFF_MULT: Record<Effectiveness, number> = { super: 2.0, good: 1.4, normal: 1.0, weak: 0.5, backfire: -0.6 };

export function createEncounter(def: EncounterDef, energy: number, hasTruck: boolean, sageName: string): EncounterState {
  return {
    def,
    resolution: def.startResolution ?? 0,
    energy,
    listened: false,
    sageUsed: false,
    coffeeUsed: 0,
    resistTurns: 0,
    delayTurns: 0,
    turn: 0,
    log: [],
    moraleDelta: 0,
    over: null,
    volunteerUsed: false,
    hasTruck,
    sageName,
  };
}

export function effectivenessOf(st: EncounterState, move: MoveId): Effectiveness {
  const d = st.def;
  let eff: Effectiveness = d.effectiveness[move] ?? 'normal';
  if (st.listened && d.afterListen && d.afterListen[move]) eff = d.afterListen[move] as Effectiveness;
  return eff;
}

export function moveCost(move: MoveId): number { return BALANCE.moveEnergyCost[move]; }

export function canUse(st: EncounterState, move: MoveId): { ok: boolean; reason?: string } {
  if (st.def.moveDisabled && st.def.moveDisabled[move]) return { ok: false, reason: st.def.moveDisabled[move] };
  if (move === 'sage' && st.sageUsed) return { ok: false, reason: `${st.sageName} already weighed in.` };
  if (move === 'coffee' && st.coffeeUsed >= 2) return { ok: false, reason: 'You are out of coffee. Tragic.' };
  if (st.energy < moveCost(move) && move !== 'coffee') return { ok: false, reason: 'Not enough energy.' };
  return { ok: true };
}

export interface TurnResult {
  playerText: string[];
  effect: Effectiveness;
  gain: number;
  opponentText: string[];
  opponentMove?: OpponentMove;
  over: 'win' | 'lose' | null;
}

/** Run one player move, then (if not over) the opponent's response. */
export function playerMove(st: EncounterState, move: MoveId, rng: () => number = Math.random): TurnResult {
  const d = st.def;
  const eff = effectivenessOf(st, move);
  const cost = moveCost(move);
  st.energy = Math.max(0, st.energy - cost);
  st.turn++;
  const text: string[] = [];

  let gain = 0;
  let effUsed: Effectiveness = eff;
  if (move === 'listen') {
    st.listened = true;
    gain = BASE_POWER.listen * EFF_MULT[eff];
    text.push('You listen. Actually listen.');
    text.push(d.clue);
  } else if (move === 'sage') {
    st.sageUsed = true;
    gain = BASE_POWER.sage;
    text.push(`You text ${st.sageName}. He replies instantly. Does he sleep?`);
    text.push(`${st.sageName}: "${d.sageAdvice}"`);
    st.listened = true; // the sage's advice reveals the tell too
  } else if (move === 'volunteer' && st.hasTruck && d.truckSolves) {
    gain = 999;
    effUsed = 'super';
    text.push('A Volunteer With a Truck appears.');
    text.push('It solves a surprising number of problems. Including this one.');
  } else {
    let mult = EFF_MULT[eff];
    if (move === 'volunteer' && st.hasTruck) mult += 0.5;
    gain = BASE_POWER[move] * mult;
    if (move === 'coffee') {
      st.coffeeUsed++;
      st.energy = Math.min(BALANCE.maxEnergy, st.energy + 12);
      text.push('You offer coffee. It is the good stuff.');
    } else if (move === 'meeting') {
      st.resistTurns = 0;
      st.delayTurns = 0;
      text.push('You call a meeting. An actual one. With an agenda.');
    } else {
      text.push(defaultPlayerText(move));
    }
    if (d.flavor && d.flavor[move]) text.push(d.flavor[move] as string);
  }
  if (st.resistTurns > 0 && gain > 0) { gain *= 0.5; text.push('Resistance is high. It only half lands.'); }
  if (st.delayTurns > 0 && gain > 0) { gain *= 0.6; text.push('The subcommittee slows everything down.'); }
  gain = Math.round(gain);
  st.resolution = Math.max(0, Math.min(d.target, st.resolution + gain));
  if (gain > 0) text.push(effectivenessText(effUsed, gain));
  else if (gain < 0) text.push(`That backfired. Resolution ${gain}.`);
  st.lastEffect = effUsed;

  if (st.resistTurns > 0) st.resistTurns--;
  if (st.delayTurns > 0) st.delayTurns--;

  const result: TurnResult = { playerText: text, effect: effUsed, gain, opponentText: [], over: null };
  if (st.resolution >= d.target) { st.over = 'win'; result.over = 'win'; return result; }

  // Opponent turn
  const om = pickOpponentMove(st, rng);
  result.opponentMove = om;
  result.opponentText.push(`${d.name} uses ${om.name}!`);
  result.opponentText.push(om.text);
  if (om.resolution) {
    st.resolution = Math.max(0, st.resolution + om.resolution);
    result.opponentText.push(om.resolution < 0 ? `Resolution ${om.resolution}.` : `Resolution +${om.resolution}.`);
  }
  if (om.energy) {
    st.energy = Math.max(0, Math.min(BALANCE.maxEnergy, st.energy + om.energy));
    result.opponentText.push(om.energy < 0 ? `Your energy drops ${-om.energy}.` : `Energy +${om.energy}.`);
  }
  if (om.morale) { st.moraleDelta += om.morale; result.opponentText.push(`Congregation morale ${om.morale}.`); }
  if (om.resist) { st.resistTurns += om.resist; result.opponentText.push('Resistance rises!'); }
  if (om.delay) { st.delayTurns += om.delay; result.opponentText.push('Progress is delayed.'); }

  if (st.energy <= 0) { st.over = 'lose'; result.over = 'lose'; }
  return result;
}

function pickOpponentMove(st: EncounterState, rng: () => number): OpponentMove {
  const moves = st.def.moves;
  // avoid stacking resist/delay endlessly
  const usable = moves.filter((m) => !((m.resist && st.resistTurns > 1) || (m.delay && st.delayTurns > 1)));
  const pool = usable.length ? usable : moves;
  return pool[Math.floor(rng() * pool.length)];
}

function defaultPlayerText(move: MoveId): string {
  switch (move) {
    case 'vision': return 'You explain the vision. Hands move. A whiteboard is implied.';
    case 'volunteer': return 'You recruit a volunteer. They say yes before you finish the sentence.';
    case 'boundary': return 'You set a boundary. Kindly. Firmly. Like a pastor who lifts.';
    default: return '';
  }
}

export function effectivenessText(eff: Effectiveness, gain: number): string {
  switch (eff) {
    case 'super': return `It's SUPER effective! Resolution +${gain}.`;
    case 'good': return `That really helped. Resolution +${gain}.`;
    case 'normal': return `It helps. Resolution +${gain}.`;
    case 'weak': return `Not very effective... Resolution +${gain}.`;
    case 'backfire': return `Oof. Resolution ${gain}.`;
  }
}

/** Hint shown in the encounter menu after listening. */
export function hintFor(st: EncounterState): string | null {
  if (!st.listened) return null;
  const best = (Object.keys(BASE_POWER) as MoveId[])
    .filter((m) => m !== 'listen' && m !== 'sage')
    .map((m) => ({ m, e: effectivenessOf(st, m) }))
    .filter((x) => x.e === 'super' || x.e === 'good')
    .sort((a, b) => (a.e === 'super' ? -1 : 1) - (b.e === 'super' ? -1 : 1));
  if (!best.length) return null;
  return `Try: ${best.slice(0, 2).map((b) => MOVE_INFO[b.m].short).join(' / ')}`;
}
