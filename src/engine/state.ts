/**
 * Game state + versioned save/load. Pure data, no Phaser.
 */
import { BALANCE } from '../data/balance';

export const SAVE_KEY = 'heerikman-quest-save';
export const SAVE_VERSION = 3;

export type QuestStatus = 'inactive' | 'active' | 'done';
export interface QuestState { status: QuestStatus; stage: number; outcome?: string }

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface GameState {
  version: number;
  fund: number;
  goodwill: number;
  morale: number;
  energy: number;
  day: number;
  map: string;
  x: number;
  y: number;
  dir: Dir;
  flags: Record<string, number | boolean | string>;
  quests: Record<string, QuestState>;
  allies: string[];
  eventCooldown: number;
  seenEvents: string[];
  mute: boolean;
  playtimeMs: number;
  ending?: 'buy' | 'build';
}

export function newGameState(): GameState {
  return {
    version: SAVE_VERSION,
    fund: BALANCE.startFund,
    goodwill: BALANCE.startGoodwill,
    morale: BALANCE.startMorale,
    energy: BALANCE.maxEnergy,
    day: 1,
    map: 'office',
    x: 4,
    y: 4,
    dir: 'down',
    flags: {},
    quests: {},
    allies: [],
    eventCooldown: BALANCE.eventCooldownDays,
    seenEvents: [],
    mute: false,
    playtimeMs: 0,
  };
}

export type ResourceKey = 'fund' | 'goodwill' | 'morale' | 'energy';

export interface ResourceChange { key: ResourceKey; delta: number; value: number }

type Listener = (change: ResourceChange) => void;

/** Wrapper that owns the state and reports resource changes for on-screen feedback. */
export class Game {
  state: GameState;
  private listeners: Listener[] = [];

  constructor(state?: GameState) {
    this.state = state ?? newGameState();
  }

  onChange(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }

  change(key: ResourceKey, delta: number): number {
    const s = this.state;
    const before = s[key];
    let after = before + delta;
    if (key === 'fund') after = Math.max(0, Math.round(after));
    else if (key === 'energy') after = Math.max(0, Math.min(BALANCE.maxEnergy, Math.round(after)));
    else after = Math.max(0, Math.min(100, Math.round(after)));
    s[key] = after;
    const realDelta = after - before;
    if (realDelta !== 0) this.listeners.forEach((l) => l({ key, delta: realDelta, value: after }));
    return realDelta;
  }

  flag(name: string): number | boolean | string | undefined { return this.state.flags[name]; }
  has(name: string): boolean { return !!this.state.flags[name]; }
  set(name: string, value: number | boolean | string = true): void { this.state.flags[name] = value; }
  inc(name: string, by = 1): number {
    const v = (typeof this.state.flags[name] === 'number' ? (this.state.flags[name] as number) : 0) + by;
    this.state.flags[name] = v;
    return v;
  }

  quest(id: string): QuestState {
    return this.state.quests[id] ?? { status: 'inactive', stage: 0 };
  }
  questIs(id: string, status: QuestStatus): boolean { return this.quest(id).status === status; }
  questStage(id: string): number { return this.quest(id).stage; }
  setQuest(id: string, patch: Partial<QuestState>): void {
    const cur = this.quest(id);
    this.state.quests[id] = { ...cur, ...patch };
  }
  isAlly(id: string): boolean { return this.state.allies.includes(id); }
  addAlly(id: string): boolean {
    if (this.isAlly(id)) return false;
    this.state.allies.push(id);
    return true;
  }

  // ---- persistence ----
  save(): boolean {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      return true;
    } catch { return false; }
  }
  static hasSave(): boolean {
    try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
  }
  static load(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<GameState>;
      return migrate(data);
    } catch { return null; }
  }
  static clearSave(): void {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  }
}

/** Bring older saves up to the current version; fill in missing fields. */
export function migrate(data: Partial<GameState>): GameState | null {
  if (!data || typeof data !== 'object') return null;
  const base = newGameState();
  const v = typeof data.version === 'number' ? data.version : 0;
  if (v > SAVE_VERSION) return null; // from the future; refuse
  const merged: GameState = { ...base, ...data, version: SAVE_VERSION } as GameState;
  merged.flags = { ...(data.flags ?? {}) };
  merged.quests = { ...(data.quests ?? {}) };
  merged.allies = Array.isArray(data.allies) ? [...data.allies] : [];
  merged.seenEvents = Array.isArray(data.seenEvents) ? [...data.seenEvents] : [];
  // v1 -> v2: energy scale changed from 0-10 to 0-100
  if (v < 2 && typeof merged.energy === 'number' && merged.energy <= 10) merged.energy *= 10;
  // v2 -> v3: eventCooldown introduced
  if (v < 3 && typeof merged.eventCooldown !== 'number') merged.eventCooldown = BALANCE.eventCooldownDays;
  return merged;
}
