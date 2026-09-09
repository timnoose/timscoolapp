/**
 * Map definition helpers. Maps are built from: a base fill, rect fills,
 * stamps (2D arrays of tile names), NPCs, doors and interactables.
 */
import type { Dir } from './state';

export interface NpcPlacement {
  id: string;            // cast id
  x: number; y: number;
  dir?: Dir;
  dialogue: string;      // dialogue resolver key (src/data/dialogue.ts -> TALK)
  when?: string;         // optional presence flag key resolved by data (see npcVisible)
  wander?: boolean;
}
export interface Door { x: number; y: number; to: { map: string; x: number; y: number; dir?: Dir }; sfx?: string }
export interface Interact { x: number; y: number; dialogue: string; name?: string }

export interface MapDef {
  id: string;
  w: number; h: number;
  fill: string;
  ground: (string | null)[][];   // tile names, null = fill
  objects: (string | null)[][];  // object layer (drawn above ground)
  npcs: NpcPlacement[];
  doors: Door[];
  interacts: Interact[];
  music: string;
  indoor: boolean;
  name: string;
}

export class MapBuilder {
  def: MapDef;
  constructor(id: string, name: string, w: number, h: number, fill: string, music: string, indoor = false) {
    this.def = {
      id, name, w, h, fill, music, indoor,
      ground: Array.from({ length: h }, () => Array(w).fill(null)),
      objects: Array.from({ length: h }, () => Array(w).fill(null)),
      npcs: [], doors: [], interacts: [],
    };
  }
  g(x: number, y: number, tile: string): this {
    if (this.inside(x, y)) this.def.ground[y][x] = tile;
    return this;
  }
  o(x: number, y: number, tile: string | null): this {
    if (this.inside(x, y)) this.def.objects[y][x] = tile;
    return this;
  }
  rect(x: number, y: number, w: number, h: number, tile: string, layer: 'g' | 'o' = 'g'): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) (layer === 'g' ? this.g(x + i, y + j, tile) : this.o(x + i, y + j, tile));
    return this;
  }
  /** Alternate two tiles in a checker/stripe pattern. */
  stripeV(x: number, y: number, w: number, h: number, a: string, b: string, every = 2): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.g(x + i, y + j, i % every === 0 ? b : a);
    return this;
  }
  /** Stamp a grid of tile names (space separated tokens, '.' = skip). */
  stamp(x: number, y: number, rows: string[], layer: 'g' | 'o' = 'g'): this {
    rows.forEach((row, j) => {
      row.trim().split(/\s+/).forEach((tok, i) => {
        if (tok === '.') return;
        if (layer === 'g') this.g(x + i, y + j, tok); else this.o(x + i, y + j, tok);
      });
    });
    return this;
  }
  scatter(tile: string, coords: [number, number][], layer: 'g' | 'o' = 'o'): this {
    coords.forEach(([x, y]) => (layer === 'g' ? this.g(x, y, tile) : this.o(x, y, tile)));
    return this;
  }
  npc(p: NpcPlacement): this { this.def.npcs.push(p); return this; }
  door(x: number, y: number, map: string, tx: number, ty: number, dir: Dir = 'down', sfx = 'door'): this {
    this.def.doors.push({ x, y, to: { map, x: tx, y: ty, dir }, sfx });
    return this;
  }
  interact(x: number, y: number, dialogue: string, name?: string): this {
    this.def.interacts.push({ x, y, dialogue, name });
    return this;
  }
  inside(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < this.def.w && y < this.def.h; }
  build(): MapDef { return this.def; }
}
