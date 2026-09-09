/**
 * 32x32 dialogue portraits, layered: face + hair + beard + glasses + expression.
 */
import { overlay, remap, type Palette, type Rows } from './pixel';
import type { HairStyle } from './characters';

export type Mood = 'neutral' | 'happy' | 'angry' | 'sad' | 'tired' | 'shocked' | 'smug';

export interface PortraitSpec {
  skin: string;
  hair: string;
  shirt: string;
  hairStyle: HairStyle;
  beard?: boolean;
  glasses?: boolean;
  capColor?: string;
  lipstick?: boolean;
  earrings?: boolean;
}

const FACE: Rows = [
  '................................',
  '................................',
  '..........xxxxxxxxxxxx..........',
  '........xxhhhhhhhhhhhhxx........',
  '.......xhhhhhhhhhhhhhhhhx.......',
  '......xhhhhhhhhhhhhhhhhhhx......',
  '......xhhhhhhhhhhhhhhhhhhx......',
  '.....xhhhhhhhhhhhhhhhhhhhhx.....',
  '.....xhhhhsssssssssssshhhhx.....',
  '.....xhhsssssssssssssssshhx.....',
  '.....xhssssssssssssssssssx......'.slice(0, 31) + '.',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '.....xsssssssssSSsssssssssx.....',
  '.....xssssssssssssssssssssx.....',
  '......xssssssssssssssssssx......',
  '......xssssssssssssssssssx......',
  '.......xssssssssssssssssx.......',
  '........xssssssssssssssx........',
  '.........xxsssssssssssxx........'.slice(0, 32),
  '...........xxxssssxxxx..........',
  '..............xssx..............',
  '..........xxxxxssxxxxx..........',
  '.......xxxcccccccccccccxxx......',
  '.....xxccccccccccccccccccxx.....',
  '....xccccccccccccccccccccccx....',
  '....xccccccccccccccccccccccx....',
];
// fix row 10 to be symmetric
FACE[10] = '.....xhsssssssssssssssssshx.....';
FACE[24] = '.........xxsssssssssssxx........';

const EYES_NEUTRAL: Rows = lines(32, {
  13: '.........xxx.......xxx..........',
  15: '.........xeexs...sxeex..........'.replace(/s/g, '.'),
  16: '.........xewx.....xewx..........'.replace(/x/g, 'e').replace('e', 'e'),
});
const EYES_HAPPY: Rows = lines(32, {
  13: '.........xxx.......xxx..........',
  15: '.........e..e.....e..e..........',
  16: '..........ee.......ee...........',
});
const EYES_ANGRY: Rows = lines(32, {
  12: '.........xx...........xx........',
  13: '..........xxx.......xxx.........',
  14: '............x.......x...........',
  15: '.........xeex.....xeex..........',
  16: '.........xeee.....eeex..........',
});
const EYES_SAD: Rows = lines(32, {
  12: '............xx.....xx...........',
  13: '..........xx.........xx.........',
  15: '.........xeex.....xeex..........',
  16: '.........xeex.....xeex..........',
});
const EYES_TIRED: Rows = lines(32, {
  13: '.........xxx.......xxx..........',
  15: '.........xxxx.....xxxx..........',
  16: '.........xeex.....xeex..........',
  17: '.........SSSS.....SSSS..........',
});
const EYES_SHOCKED: Rows = lines(32, {
  12: '.........xxx.......xxx..........',
  14: '.........xeex.....xeex..........',
  15: '.........xwex.....xwex..........',
  16: '.........xeex.....xeex..........',
});
const MOUTH_NEUTRAL: Rows = lines(32, { 21: '.............mmmmmm.............' });
const MOUTH_HAPPY: Rows = lines(32, {
  20: '............m......m............',
  21: '.............mmmmmm.............',
});
const MOUTH_BIG: Rows = lines(32, {
  20: '...........mmmmmmmmmm...........',
  21: '............mwwwwwwm............',
  22: '.............mmmmmm.............',
});
const MOUTH_FROWN: Rows = lines(32, {
  21: '.............mmmmmm.............',
  22: '............m......m............',
});
const MOUTH_OPEN: Rows = lines(32, {
  20: '.............mmmmm..............',
  21: '.............mMMMm..............',
  22: '.............mmmmm..............',
});
const MOUTH_SMUG: Rows = lines(32, {
  20: '..................mm............',
  21: '.............mmmmm..............',
});
const SWEAT: Rows = lines(32, {
  9: '..........................x.....',
  10: '.........................xwx....',
  11: '.........................xwwx...',
  12: '..........................xx....',
});

const BEARD: Rows = lines(32, {
  16: '......bb..............bb........',
  17: '.....bbb..............bbb.......',
  18: '.....bbbb............bbbb.......',
  19: '.....bbbbb....bb....bbbbb.......',
  20: '......bbbb..bbbbbb..bbbb........',
  21: '......bbbbb........bbbbb........',
  22: '.......bbbbb......bbbbb.........',
  23: '........bbbbbbbbbbbbbb..........',
  24: '.........bbbbbbbbbbbbb..........',
  25: '..........bbbbbbbbbbb...........',
  26: '...........bbbbbbbbb............',
  27: '.............bbbbbb.............',
});
const GLASSES: Rows = lines(32, {
  14: '........aaaaaa...aaaaaa.........',
  15: '........a....aaaaa....a.........',
  16: '........a....a...a....a.........',
  17: '........aaaaaa...aaaaaa.........',
});
const CAP: Rows = lines(32, {
  1: '..........xxxxxxxxxxxx..........',
  2: '........xxkkkkkkkkkkkkxx........',
  3: '.......xkkkkkkkkkkkkkkkkx.......',
  4: '......xkkkkkkkkkkkkkkkkkkx......',
  5: '......xkkkkkkkkkkkkkkkkkkx......',
  6: '.....xkkkkkkkkkkkkkkkkkkkkx.....',
  7: '.....xkkkkkkkkkkkkkkkkkkkkx.....',
  8: '..xxxxkkkkkkkkkkkkkkkkkkkkxxxx..',
  9: '.xkkkkkkkkkkkkkkkkkkkkkkkkkkkkx.',
  10: '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..',
});
const LONG: Rows = lines(32, {
  10: '.....xhh..................hhx...',
  11: '.....xhh..................hhx...',
  12: '.....xhh..................hhx...',
  13: '.....xhh..................hhx...',
  14: '.....xhh..................hhx...',
  15: '.....xhh..................hhx...',
  16: '.....xhh..................hhx...',
  17: '.....xhh..................hhx...',
  18: '.....xhh..................hhx...',
  19: '.....xhh..................hhx...',
  20: '.....xhh..................hhx...',
  21: '.....xhh..................hhx...',
  22: '.....xhh..................hhx...',
  23: '.....xhhx................xhhx...',
  24: '.....xhhx................xhhx...',
  25: '.....xhhx................xhhx...',
  26: '.....xhhhx..............xhhhx...',
  27: '.....xhhhhx............xhhhhx...',
  28: '......xxxxx............xxxxx....',
});
const BUN: Rows = lines(32, {
  0: '.............xxxxxx.............',
  1: '............xhhhhhhx............',
  2: '............xhhhhhhx............',
  3: '.............xxxxxx.............',
});
const CURLY: Rows = lines(32, {
  1: '.........xx..xxxx..xx...........',
  2: '........xhhxxhhhhxxhhx..........',
  3: '.......xhhhhhhhhhhhhhhx.........',
  4: '......xhhhhhhhhhhhhhhhhx........',
  8: '....xhhhh..............hhhhx....',
  9: '....xhhhh..............hhhhx....',
  10: '.....xhhh..............hhhx.....',
  11: '......xhh..............hhx......',
  12: '.......xx..............xx.......',
});
const EARRINGS: Rows = lines(32, {
  19: '.....%....................%.....',
  20: '.....%....................%.....',
});

function lines(h: number, defs: Record<number, string>): Rows {
  const out: Rows = [];
  for (let y = 0; y < h; y++) out.push(defs[y] ?? '.'.repeat(32));
  return out;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function buildPortrait(spec: PortraitSpec, mood: Mood): { rows: Rows; palette: Palette } {
  let rows = FACE;
  if (spec.hairStyle === 'bald') rows = remap(rows, { h: 's' });
  if (spec.hairStyle === 'long') rows = overlay(rows, LONG);
  if (spec.hairStyle === 'bun') rows = overlay(rows, BUN);
  if (spec.hairStyle === 'curly') rows = overlay(rows, CURLY);
  // eyes
  const eyes = mood === 'happy' ? EYES_HAPPY : mood === 'angry' ? EYES_ANGRY : mood === 'sad' ? EYES_SAD : mood === 'tired' ? EYES_TIRED : mood === 'shocked' ? EYES_SHOCKED : EYES_NEUTRAL;
  rows = overlay(rows, eyes);
  if (spec.beard) rows = overlay(rows, BEARD);
  const mouth = mood === 'happy' ? MOUTH_BIG : mood === 'angry' ? MOUTH_FROWN : mood === 'sad' ? MOUTH_FROWN : mood === 'shocked' ? MOUTH_OPEN : mood === 'smug' ? MOUTH_SMUG : mood === 'tired' ? MOUTH_NEUTRAL : MOUTH_HAPPY;
  rows = overlay(rows, mouth);
  if (spec.glasses) rows = overlay(rows, GLASSES);
  if (spec.hairStyle === 'cap') rows = overlay(rows, CAP);
  if (spec.earrings) rows = overlay(rows, EARRINGS);
  if (mood === 'tired' || mood === 'shocked') rows = overlay(rows, SWEAT);
  const palette: Palette = {
    x: '#1a1420',
    s: spec.skin,
    S: shade(spec.skin, -30),
    h: spec.hairStyle === 'gray' ? '#b8b8c0' : spec.hair,
    c: spec.shirt,
    e: '#1a1420',
    w: '#ffffff',
    b: shade(spec.hair, -10),
    k: spec.capColor ?? '#202028',
    a: '#e8e8ff',
    m: spec.lipstick ? '#b03050' : shade(spec.skin, -55),
    M: '#4a1a1a',
    '%': '#ffd76a',
  };
  return { rows, palette };
}

export const MOODS: Mood[] = ['neutral', 'happy', 'angry', 'sad', 'tired', 'shocked', 'smug'];
