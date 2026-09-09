/**
 * Dialogue script format. Content lives in src/data/dialogue.ts.
 * A dialogue is a list of steps. Steps run in order unless a goto/branch jumps.
 */
import type { Game, ResourceKey } from './state';
import type { Mood } from '../art/portraits';

export type Cond = (g: Game) => boolean;

export interface Effect {
  fund?: number;
  goodwill?: number;
  morale?: number;
  energy?: number;
  set?: string;                 // set flag true
  setValue?: [string, number | string | boolean];
  inc?: string;                 // increment numeric flag
  quest?: [string, 'active' | 'done', number?]; // set quest status (+ optional stage)
  stage?: [string, number];     // set quest stage
  outcome?: [string, string];   // set quest outcome text
  ally?: string;
  sfx?: string;
  restDay?: boolean;
  fullEnergy?: boolean;
  ending?: 'buy' | 'build';
  warp?: { map: string; x: number; y: number; dir?: 'down' | 'up' | 'left' | 'right' };
  custom?: (g: Game) => void;
  scene?: 'serviceStart' | 'serviceEnd';   // world set pieces
  fx?: 'amen' | 'offering' | 'cheer';      // world visual effects
}

export interface LineStep {
  who?: string;   // cast id; undefined = narrator
  mood?: Mood;
  text: string;
}
export interface ChoiceOption {
  label: string;
  goto?: string;
  effects?: Effect[];
  require?: Cond;    // hidden if false
  disabled?: Cond;   // shown but greyed with a reason
  disabledText?: string;
}
export interface ChoiceStep { choice: ChoiceOption[]; prompt?: string }
export interface EffectStep { effects: Effect[] }
export interface GotoStep { goto: string }
export interface BranchStep { if: Cond; then: string; else?: string }
export interface EncounterStep { encounter: string; win: string; lose: string }
export interface EndStep { end: true }
export interface ShopStep { fundCheck: number; then: string; else: string }

export type Step = LineStep | ChoiceStep | EffectStep | GotoStep | BranchStep | EncounterStep | EndStep | ShopStep;
export type Dialogues = Record<string, Step[]>;

export function isLine(s: Step): s is LineStep { return (s as LineStep).text !== undefined; }
export function isChoice(s: Step): s is ChoiceStep { return (s as ChoiceStep).choice !== undefined; }
export function isEffects(s: Step): s is EffectStep { return (s as EffectStep).effects !== undefined; }
export function isGoto(s: Step): s is GotoStep { return (s as GotoStep).goto !== undefined; }
export function isBranch(s: Step): s is BranchStep { return (s as BranchStep).if !== undefined; }
export function isEncounter(s: Step): s is EncounterStep { return (s as EncounterStep).encounter !== undefined; }
export function isEnd(s: Step): s is EndStep { return (s as EndStep).end === true; }
export function isFundCheck(s: Step): s is ShopStep { return (s as ShopStep).fundCheck !== undefined; }

export interface EffectResult {
  restDay?: boolean;
  ending?: 'buy' | 'build';
  warp?: Effect['warp'];
  sfx?: string[];
  questStarted?: string[];
  questDone?: string[];
  allyAdded?: string[];
  scene?: string[];
  fx?: string[];
}

/** Apply a list of effects to the game; returns things the scene must react to. */
export function applyEffects(g: Game, effects: Effect[]): EffectResult {
  const res: EffectResult = { sfx: [], questStarted: [], questDone: [], allyAdded: [], scene: [], fx: [] };
  for (const e of effects) {
    (['fund', 'goodwill', 'morale', 'energy'] as ResourceKey[]).forEach((k) => {
      if (typeof e[k] === 'number') g.change(k, e[k] as number);
    });
    if (e.set) g.set(e.set, true);
    if (e.setValue) g.set(e.setValue[0], e.setValue[1]);
    if (e.inc) g.inc(e.inc);
    if (e.quest) {
      const [id, status, stage] = e.quest;
      const prev = g.quest(id).status;
      g.setQuest(id, { status, stage: stage ?? g.quest(id).stage });
      if (status === 'active' && prev !== 'active') res.questStarted!.push(id);
      if (status === 'done' && prev !== 'done') res.questDone!.push(id);
    }
    if (e.stage) g.setQuest(e.stage[0], { stage: e.stage[1] });
    if (e.outcome) g.setQuest(e.outcome[0], { outcome: e.outcome[1] });
    if (e.ally && g.addAlly(e.ally)) res.allyAdded!.push(e.ally);
    if (e.sfx) res.sfx!.push(e.sfx);
    if (e.restDay) res.restDay = true;
    if (e.fullEnergy) g.change('energy', 1000);
    if (e.ending) { res.ending = e.ending; g.state.ending = e.ending; }
    if (e.warp) res.warp = e.warp;
    if (e.custom) e.custom(g);
    if (e.scene) res.scene!.push(e.scene);
    if (e.fx) res.fx!.push(e.fx);
  }
  return res;
}
