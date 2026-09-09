/**
 * Character sprites: 16x24, built from a base body plus overlays.
 * Frames per character: down0-2, up0-2, left0-2, right0-2 (right = mirrored left).
 * Palette keys: x outline, s skin, S skin shadow, h hair, c shirt, C shirt shade,
 * p pants, o shoes, e eye, b beard, k cap, v vest, a glasses, m mouth, t tattoo, w white.
 */
import { flipH, overlay, remap, shift, type Palette, type Rows } from './pixel';

export type HairStyle = 'short' | 'bald' | 'cap' | 'long' | 'bun' | 'curly' | 'gray';

export interface CharacterSpec {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  shoes?: string;
  hairStyle: HairStyle;
  beard?: boolean;
  glasses?: boolean;
  vest?: boolean; // puffer vest over the shirt
  capColor?: string;
  tattoo?: boolean;
  wide?: boolean; // big guy
}

// ---- Base body, facing down ----
const DOWN_STAND: Rows = [
  '................',
  '................',
  '.....xxxxxx.....',
  '....xhhhhhhx....',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhsssshhx...',
  '...xssssssssx...',
  '...xsessssesx...',
  '...xssssssssx...',
  '...xSssssssSx...',
  '....xssmmssx....',
  '.....xssssx.....',
  '....xxccccxx....',
  '..xccccccccccx..',
  '.xccccccccccccx.',
  '.xccCccccccCccx.',
  '.xccCccccccCccx.',
  '.xssxccccccxssx.',
  '..xxxppppppxxx..',
  '....xppppppx....',
  '....xppxxppx....',
  '....xooxxoox....',
  '....xxx..xxx....',
];
const DOWN_WALK_A: Rows = [
  '................',
  '................',
  '.....xxxxxx.....',
  '....xhhhhhhx....',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhsssshhx...',
  '...xssssssssx...',
  '...xsessssesx...',
  '...xssssssssx...',
  '...xSssssssSx...',
  '....xssmmssx....',
  '.....xssssx.....',
  '....xxccccxx....',
  '..xccccccccccx..',
  '.xccccccccccccx.',
  '.xccCccccccCccx.',
  '.xssCccccccCccx.',
  '.xxxxccccccxssx.',
  '....xppppppxxx..',
  '....xppppppx....',
  '....xoox.ppx....',
  '....xxx.xppx....',
  '........xoox....',
];

// ---- Facing up (back of head) ----
const UP_STAND: Rows = [
  '................',
  '................',
  '.....xxxxxx.....',
  '....xhhhhhhx....',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '....xhhhhhhx....',
  '.....xssssx.....',
  '....xxccccxx....',
  '..xccccccccccx..',
  '.xccccccccccccx.',
  '.xccCccccccCccx.',
  '.xccCccccccCccx.',
  '.xssxccccccxssx.',
  '..xxxppppppxxx..',
  '....xppppppx....',
  '....xppxxppx....',
  '....xooxxoox....',
  '....xxx..xxx....',
];
const UP_WALK_A: Rows = [
  '................',
  '................',
  '.....xxxxxx.....',
  '....xhhhhhhx....',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '...xhhhhhhhhx...',
  '....xhhhhhhx....',
  '.....xssssx.....',
  '....xxccccxx....',
  '..xccccccccccx..',
  '.xccccccccccccx.',
  '.xccCccccccCccx.',
  '.xssCccccccCccx.',
  '.xxxxccccccxssx.',
  '....xppppppxxx..',
  '....xppppppx....',
  '....xoox.ppx....',
  '....xxx.xppx....',
  '........xoox....',
];

// ---- Facing left ----
const LEFT_STAND: Rows = [
  '................',
  '................',
  '......xxxxx.....',
  '.....xhhhhhx....',
  '....xhhhhhhhx...',
  '....xhhhhhhhx...',
  '....xshhhhhhx...',
  '....xsssshhhx...',
  '....xsesshhhx...',
  '....xsssshhhx...',
  '....xSssshhhx...',
  '.....xsmshhx....',
  '......xsssx.....',
  '......xccccx....',
  '.....xccccccx...',
  '.....xccccccx...',
  '.....xcCccccx...',
  '.....xcCccccx...',
  '.....xsSxcccx...',
  '......xppppx....',
  '......xppppx....',
  '......xppppx....',
  '......xooox.....',
  '......xxxxx.....',
];
const LEFT_WALK_A: Rows = [
  '................',
  '................',
  '......xxxxx.....',
  '.....xhhhhhx....',
  '....xhhhhhhhx...',
  '....xhhhhhhhx...',
  '....xshhhhhhx...',
  '....xsssshhhx...',
  '....xsesshhhx...',
  '....xsssshhhx...',
  '....xSssshhhx...',
  '.....xsmshhx....',
  '......xsssx.....',
  '......xccccx....',
  '.....xccccccx...',
  '.....xccccccx...',
  '.....xcCccccx...',
  '.....xsSccccx...',
  '.....xxxxcccx...',
  '.....xppppppx...',
  '....xpppxxppx...',
  '....xppx..xpx...',
  '....xoox..xox...',
  '....xxxx..xxx...',
];
const LEFT_WALK_B: Rows = [
  '................',
  '................',
  '......xxxxx.....',
  '.....xhhhhhx....',
  '....xhhhhhhhx...',
  '....xhhhhhhhx...',
  '....xshhhhhhx...',
  '....xsssshhhx...',
  '....xsesshhhx...',
  '....xsssshhhx...',
  '....xSssshhhx...',
  '.....xsmshhx....',
  '......xsssx.....',
  '......xccccx....',
  '.....xccccccx...',
  '.....xccccccx...',
  '.....xcCccccx...',
  '.....xcCccccx...',
  '.....xsSxcccx...',
  '......xppppx....',
  '......xppppxx...',
  '......xpxxppx...',
  '.....xoox.xox...',
  '.....xxxx.xxx...',
];

// ---- Overlays (head region). '.' = keep base ----
const BEARD_DOWN: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '....b......b....', '....bb.bb.bb....', '.....bbbbbb.....',
  '......bbbb......', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const BEARD_LEFT: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '.....b..........', '.....bbb........', '......bbb.......',
  '.......bb.......', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const GLASSES_DOWN: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '....aeaaaaea....', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const GLASSES_LEFT: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '.....aeaa.......', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const CAP_DOWN: Rows = [
  '................', '................', '.....xxxxxx.....', '....xkkkkkkx....',
  '...xkkkkkkkkx...', '...xkkkkkkkkx...', '..xkkkkkkkkkkx..', '...xxxxxxxxxx...',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const CAP_UP: Rows = [
  '................', '................', '.....xxxxxx.....', '....xkkkkkkx....',
  '...xkkkkkkkkx...', '...xkkkkkkkkx...', '...xkkkkkkkkx...', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const CAP_LEFT: Rows = [
  '................', '................', '......xxxxx.....', '.....xkkkkkx....',
  '....xkkkkkkkx...', '....xkkkkkkkx...', '..xxkkkkkkkkx...', '...xxxxxxxxx....',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const LONG_DOWN: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '...xh......hx...',
  '...xh......hx...', '...xh......hx...', '...xh......hx...', '...xh......hx...',
  '...xhx....xhx...', '...xhx....xhx...', '...xx......xx...', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const LONG_UP: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '...xhhhhhhhhx...',
  '...xhhhhhhhhx...', '...xhhhhhhhhx...', '...xhhhhhhhhx...', '....xhhhhhhx....',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const LONG_LEFT: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '.........hhx....',
  '.........hhx....', '........xhhx....', '........xhhx....', '.........xx.....',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
];
const BUN_DOWN: Rows = [
  '......xxxx......', '.....xhhhhx.....', '.....xhhhhx.....', '................',
  ...Array(20).fill('................'),
];
const VEST_DOWN: Rows = [
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '................', '................', '................',
  '................', '....xxvvvvxx....', '..xvvvccccvvvx..', '.xccvvvccvvvccx.',
  '.xccCvvvvvvCccx.', '.xccCvvvvvvCccx.', '.xssxvvvvvvxssx.', '..xxxppppppxxx..',
  '................', '................', '................', '................',
];
const VEST_UP: Rows = [
  ...Array(13).fill('................'),
  '....xxvvvvxx....', '..xvvvvvvvvvvx..', '.xccvvvvvvvvccx.',
  '.xccCvvvvvvCccx.', '.xccCvvvvvvCccx.', '.xssxvvvvvvxssx.', '..xxxppppppxxx..',
  '................', '................', '................', '................',
];
const VEST_LEFT: Rows = [
  ...Array(13).fill('................'),
  '......xvvvvx....', '.....xcvvvvvx...', '.....xcvvvvvx...',
  '.....xcCvvvvx...', '.....xcCvvvvx...', '................', '................',
  '................', '................', '................', '................',
];
const TATTOO_DOWN: Rows = [
  ...Array(16).fill('................'),
  '.xcct...........', '.xcct...........', ...Array(6).fill('................'),
];

// ---- Flex pose (title screen): fists up, chest out ----
const FLEX_DOWN: Rows = [
  '................',
  '................',
  '.....xxxxxx.....',
  '....xhhhhhhx....',
  '.xx.xhhhhhhx.xx.',
  'xssxhhhhhhhhxssx',
  'xssxhhsssshhxssx',
  'xxcxssssssssxcxx',
  '.xcxsessssesxcx.',
  '.xcxssssssssxcx.',
  '.xcxSssssssSxcx.',
  '.xccxssmmssxccx.',
  '.xcccxssssxcccx.',
  '..xccxxxxxxccx..',
  '..xccccccccccx..',
  '.xccccccccccccx.',
  '.xccCccccccCccx.',
  '.xccCccccccCccx.',
  '.xxxxccccccxxxx.',
  '..xxxppppppxxx..',
  '....xppppppx....',
  '....xppxxppx....',
  '....xooxxoox....',
  '....xxx..xxx....',
];
const FLEX_VEST: Rows = [
  ...Array(14).fill('................'),
  '..xvvvccccvvvx..', '.xccvvvccvvvccx.',
  '.xccCvvvvvvCccx.', '.xccCvvvvvvCccx.', '.xxxxvvvvvvxxxx.',
  ...Array(5).fill('................'),
];

/** Two-frame flexing pose for the hero (used on the title screen). */
export function buildFlexFrames(spec: CharacterSpec): CharacterFrames {
  const base = buildFrame(FLEX_DOWN, 'down', { ...spec, vest: false });
  const withVest = spec.vest ? overlay(base, FLEX_VEST) : base;
  const a = withVest;
  const b = shift(withVest, 0, -1).map((r, y) => (y === 23 ? withVest[23] : r));
  const { palette } = buildCharacter(spec);
  return { frames: [a, b], palette };
}

function buildFrame(base: Rows, dir: 'down' | 'up' | 'left', spec: CharacterSpec): Rows {
  let rows = base;
  // hair styles
  if (spec.hairStyle === 'bald') rows = remap(rows, { h: 's' });
  if (spec.hairStyle === 'long') rows = overlay(rows, dir === 'down' ? LONG_DOWN : dir === 'up' ? LONG_UP : LONG_LEFT);
  if (spec.hairStyle === 'bun' && dir !== 'left') rows = overlay(rows, BUN_DOWN);
  if (spec.hairStyle === 'bun' && dir === 'left') rows = overlay(rows, shiftRowsRight(BUN_DOWN, 1));
  if (spec.vest) rows = overlay(rows, dir === 'down' ? VEST_DOWN : dir === 'up' ? VEST_UP : VEST_LEFT);
  if (spec.beard && dir === 'down') rows = overlay(rows, BEARD_DOWN);
  if (spec.beard && dir === 'left') rows = overlay(rows, BEARD_LEFT);
  if (spec.glasses && dir === 'down') rows = overlay(rows, GLASSES_DOWN);
  if (spec.glasses && dir === 'left') rows = overlay(rows, GLASSES_LEFT);
  if (spec.hairStyle === 'cap') rows = overlay(rows, dir === 'down' ? CAP_DOWN : dir === 'up' ? CAP_UP : CAP_LEFT);
  if (spec.tattoo && dir === 'down') rows = overlay(rows, TATTOO_DOWN);
  return rows;
}

function shiftRowsRight(rows: Rows, n: number): Rows {
  return rows.map((r) => '.'.repeat(n) + r.slice(0, r.length - n));
}

export interface CharacterFrames {
  frames: Rows[]; // 12 frames: down0..2, up0..2, left0..2, right0..2
  palette: Palette;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function buildCharacter(spec: CharacterSpec): CharacterFrames {
  const palette: Palette = {
    x: '#1a1420',
    s: spec.skin,
    S: shade(spec.skin, -30),
    h: spec.hairStyle === 'gray' ? '#b8b8c0' : spec.hair,
    c: spec.shirt,
    C: shade(spec.shirt, -28),
    p: spec.pants,
    o: spec.shoes ?? '#2a2222',
    e: '#1a1420',
    b: shade(spec.hair, -10),
    k: spec.capColor ?? '#202028',
    v: '#23232b',
    a: '#e8e8ff',
    m: shade(spec.skin, -50),
    t: '#3a4a6a',
    w: '#ffffff',
  };
  const down0 = buildFrame(DOWN_STAND, 'down', spec);
  const down1 = buildFrame(DOWN_WALK_A, 'down', spec);
  const down2 = flipH(down1);
  const up0 = buildFrame(UP_STAND, 'up', spec);
  const up1 = buildFrame(UP_WALK_A, 'up', spec);
  const up2 = flipH(up1);
  const left0 = buildFrame(LEFT_STAND, 'left', spec);
  const left1 = buildFrame(LEFT_WALK_A, 'left', spec);
  const left2 = buildFrame(LEFT_WALK_B, 'left', spec);
  const frames = [down0, down1, down2, up0, up1, up2, left0, left1, left2, flipH(left0), flipH(left1), flipH(left2)];
  return { frames, palette };
}

export const CHAR_W = 16;
export const CHAR_H = 24;
