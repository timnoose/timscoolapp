/**
 * Turns the pixel-art definitions into Phaser textures at boot.
 * To replace art with real PNGs later: load them in BootScene and skip the generator for that key.
 */
import Phaser from 'phaser';
import { TILES, TILE_NAMES } from '../art/tiles';
import { TILE_PALETTE } from '../art/palette';
import { drawRows, type Rows } from '../art/pixel';
import { buildCharacter, buildFlexFrames, CHAR_W, CHAR_H } from '../art/characters';
import { buildPortrait, type Mood } from '../art/portraits';
import { CAST } from '../data/cast';

export const TILE = 16;
export const TILES_PER_ROW = 16;
export const TILE_INDEX: Record<string, number> = {};
export const TILE_SOLID: boolean[] = [];

export function generateTileset(scene: Phaser.Scene): void {
  const n = TILE_NAMES.length;
  const rows = Math.ceil(n / TILES_PER_ROW);
  const tex = scene.textures.createCanvas('tiles', TILES_PER_ROW * TILE, rows * TILE)!;
  const ctx = tex.getContext();
  TILE_NAMES.forEach((name, i) => {
    const t = TILES[name];
    const x = (i % TILES_PER_ROW) * TILE;
    const y = Math.floor(i / TILES_PER_ROW) * TILE;
    drawRows(ctx, t.rows, TILE_PALETTE, x, y);
    TILE_INDEX[name] = i;
    TILE_SOLID[i] = !!t.solid;
  });
  tex.refresh();
}

export function generateCharacters(scene: Phaser.Scene): void {
  for (const member of Object.values(CAST)) {
    if (member.icon) continue;
    const key = `char-${member.id}`;
    if (scene.textures.exists(key)) continue;
    const { frames, palette } = buildCharacter(member.sprite);
    const tex = scene.textures.createCanvas(key, frames.length * CHAR_W, CHAR_H)!;
    const ctx = tex.getContext();
    frames.forEach((f, i) => drawRows(ctx, f, palette, i * CHAR_W, 0));
    frames.forEach((_, i) => tex.add(i, 0, i * CHAR_W, 0, CHAR_W, CHAR_H));
    tex.refresh();
    const dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach((d, di) => {
      const base = di * 3;
      scene.anims.create({ key: `${key}-walk-${d}`, frames: [{ key, frame: base + 1 }, { key, frame: base }, { key, frame: base + 2 }, { key, frame: base }], frameRate: 8, repeat: -1 });
    });
  }
}

/** A dozen anonymous congregants for Sunday mornings. */
export const CROWD_COUNT = 12;
export function generateCrowd(scene: Phaser.Scene): void {
  const skins = ['#c9a27a', '#ecc9a5', '#f3d9c0', '#8d5a3a', '#5e3a22', '#d4b48c'];
  const hairs = ['#221812', '#6b4a2a', '#e0c060', '#9a9a9a', '#3a2a4a', '#b04a2a', '#1a1210'];
  const shirts = ['#d05050', '#5080d0', '#3aa050', '#f0c030', '#9a4ac0', '#2aa0a0', '#ff8200', '#e8e8e8', '#73000a', '#4a4a8a'];
  const styles: import('../art/characters').HairStyle[] = ['short', 'long', 'bun', 'cap', 'bald', 'short', 'long'];
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < CROWD_COUNT; i++) {
    const key = `char-crowd-${i}`;
    if (scene.textures.exists(key)) continue;
    const spec = { skin: skins[Math.floor(rnd() * skins.length)], hair: hairs[Math.floor(rnd() * hairs.length)], shirt: shirts[Math.floor(rnd() * shirts.length)], pants: rnd() < 0.5 ? '#2b3a55' : '#3a3a44', hairStyle: styles[Math.floor(rnd() * styles.length)], beard: rnd() < 0.25, glasses: rnd() < 0.2 };
    const { frames, palette } = buildCharacter(spec);
    const tex = scene.textures.createCanvas(key, frames.length * CHAR_W, CHAR_H)!;
    const ctx = tex.getContext();
    frames.forEach((f, j) => { drawRows(ctx, f, palette, j * CHAR_W, 0); tex.add(j, 0, j * CHAR_W, 0, CHAR_W, CHAR_H); });
    tex.refresh();
  }
}

/** Title-screen flex pose for the hero. */
export function generateHeroFlex(scene: Phaser.Scene): void {
  const key = 'char-erik-flex';
  if (scene.textures.exists(key)) return;
  const { frames, palette } = buildFlexFrames(CAST.erik.sprite);
  const tex = scene.textures.createCanvas(key, frames.length * CHAR_W, CHAR_H)!;
  const ctx = tex.getContext();
  frames.forEach((f, i) => { drawRows(ctx, f, palette, i * CHAR_W, 0); tex.add(i, 0, i * CHAR_W, 0, CHAR_W, CHAR_H); });
  tex.refresh();
  scene.anims.create({ key: 'erik-flex', frames: [{ key, frame: 0 }, { key, frame: 1 }], frameRate: 3, repeat: -1 });
}

const portraitCache = new Set<string>();
export function portraitKey(scene: Phaser.Scene, castId: string, mood: Mood): string {
  const member = CAST[castId] ?? CAST.erik;
  const key = `portrait-${member.id}-${mood}`;
  if (portraitCache.has(key) && scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 32, 32)!;
  const ctx = tex.getContext();
  if (member.icon) drawIcon(ctx, member.icon);
  else {
    const { rows, palette } = buildPortrait(member.portrait, mood);
    drawRows(ctx, rows, palette, 0, 0);
  }
  tex.refresh();
  portraitCache.add(key);
  return key;
}

function drawIcon(ctx: CanvasRenderingContext2D, icon: string): void {
  const P = { x: '#1a1420', w: '#f4f4f0', g: '#c8c8c0', b: '#4a6fb8', r: '#c73b3b', y: '#f5d547', s: '#c9a27a', h: '#3a2a1a', p: '#a37bd1', t: '#8a5a3a', e: '#e8e8ff' };
  let rows: Rows = [];
  if (icon === 'thread') {
    rows = [
      '................................', '................................', '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..', '..xwwwwwwwwwwwwwwwwwwwwwwwwwwx..',
      '..xwxwwwwwwwwwwwwwwwwwwwwwxwwx..', '..xwwxwwwwwwwwwwwwwwwwwwwxwwwx..', '..xwwwxwwwwwwwwwwwwwwwwwxwwwwx..', '..xwwwwxwwwwwwwwwwwwwwwxwwwwwx..',
      '..xwwwwwxwwwwwwwwwwwwwxwwwwwwx..', '..xwwwwwwxwwwwwwwwwwwxwwwwwwwx..', '..xwwwwwwwxwwwwwwwwwxwwwwwwwwx..', '..xwwwwwwwwxwwwwwwwxwwwwwwwwwx..',
      '..xwwwwwwwwwxwwwwwxwwwwwwwwwwx..', '..xwwwwwwwwwwxwwwxwwwwwwwwwwwx..', '..xwwwwwwwwwwwxwxwwwwwwwwwwwwx..', '..xwwwwwwwwwwwwxwwwwwwwwwwwwwx..',
      '..xwwwwwwwwwwwwwwwwwwwwwwwwwwx..', '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..', '.....rrrrrrrrrrrrrrrrrrrrrr.....', '.....rwwwwwwwwwwwwwwwwwwwwr.....',
      '.....rwrrwrrrwrrrwrrwrrrwwr.....', '.....rwwwwwwwwwwwwwwwwwwwwr.....', '.....rrrrrrrrrrrrrrrrrrrrrr.....', '........yyyyyyyyyyyyyyyy........',
      '........ywwwwwwwwwwwwwwy........', '........ywyywyyywyywyyyy........', '........ywwwwwwwwwwwwwwy........', '........yyyyyyyyyyyyyyyy........',
      '..........rrrrrrrrrrrr..........', '..........rwwwwwwwwwwr..........', '..........rrrrrrrrrrrr..........', '................................',
    ];
  } else if (icon === 'form') {
    rows = [
      '................................', '......xxxxxxxxxxxxxxxxxx........', '......xwwwwwwwwwwwwwwwwxx.......', '......xwwwwwwwwwwwwwwwwxwx......',
      '......xwwwwwwwwwwwwwwwwxxxx.....', '......xwwxxxxxxxxxwwwwwwwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxxxxxwwwx.....',
      '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxxxwwwwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxxxxxxwwx.....',
      '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxwwwwwwwwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxwwxxxxxxxxxxwwwx.....',
      '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxxxxxwwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxwwwwwwwx.....',
      '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwxxxxxxxxxxxxxxxwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....', '......xwwwwwwwwwwwwwwwwwwwx.....',
      '......xwwwwwwwwwwwxxxxxxwwx.....', '......xwwwwwwwwwwwxrrrrxwwx.....', '......xwwwwwwwwwwwxrrrrxwwx.....', '......xwwwwwwwwwwwxxxxxxwwx.....',
      '......xwwwwwwwwwwwwwwwwwwwx.....', '......xxxxxxxxxxxxxxxxxxxxx.....', '................................', '................................',
    ];
  } else if (icon === 'crowd') {
    rows = [
      '................................', '................................', '..........xxxx......xxxx........', '.........xhhhhx....xhhhhx.......',
      '........xhhhhhhx..xhhhhhhx......', '........xhsssshx..xhsssshx......', '........xsssssssx.xsssssssx.....'.replace('.x', 'xx').slice(0, 32), '........xsxssxsx..xsxssxsx......',
      '........xsssssssx.xsssssssx.....'.slice(0, 32), '.........xsssssx...xsssssx......', '..........xsssx.....xsssx.......', '.........xxbbbxx...xxrrrxx......',
      '........xbbbbbbbxxxrrrrrrrx.....', '.......xbbbbbbbbxxrrrrrrrrrx....', '.......xbbbbbbbbxxrrrrrrrrrx....', '............xxxx....xxxx........',
      '...........xhhhhx..xhhhhx.......', '..........xhhhhhhxxhhhhhhx......', '..........xhsssshxxhsssshx......', '..........xsssssssxsssssssx.....',
      '..........xsxssxsxxsxssxsx......', '..........xsssssssxsssssssx.....', '...........xsssssx.xsssssx......', '............xsssx...xsssx.......',
      '...........xxpppxx.xxtttxx......', '..........xpppppppxtttttttx.....', '.........xpppppppppttttttttx....', '.........xpppppppppttttttttx....',
      '.........xpppppppppttttttttx....', '.........xxxxxxxxxxxxxxxxxxx....', '................................', '................................',
    ];
  } else if (icon === 'carpet') {
    rows = [
      '................................', '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..', '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32),
      '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32),
      '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32),
      '..xrrrrrrrrrrrrxppppppppppppx...'.slice(0, 32), '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..', '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32),
      '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32),
      '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32), '..xttttttttttttxggggggggggggx...'.slice(0, 32),
      '..xxxxxxxxxxxxxxxxxxxxxxxxxxxx..', '.....xxxxxxxxxxxxxxxxxxxxx......', '.....xwwwwwwwwwwwwwwwwwwwx......', '.....xwxxwxwxxwxxwxxwxwwwx......',
      '.....xwwwwwwwwwwwwwwwwwwwx......', '.....xxxxxxxxxxxxxxxxxxxxx......', '................................', '................................',
    ];
  } else {
    rows = [
      '................................', '................................', '........xxxxxxxxxxxxxxxx........', '........xggggggggggggggx........',
      '........xgxxxxxxxxxxxxgx........', '........xgxwwwwwwwwwwxgx........', '........xgxwwwrrrrwwwxgx........', '........xgxwwrrrrrrwwxgx........',
      '........xgxwwrrwwrrwwxgx........', '........xgxwwrrwwrrwwxgx........', '........xgxwwrrrrrrwwxgx........', '........xgxwwwrrrrwwwxgx........',
      '........xgxwwwwwwwwwwxgx........', '........xgxxxxxxxxxxxxgx........', '........xggggggggggggggx........', '........xxxxxxxxxxxxxxxx........',
      '................................', '................................', '................................', '................................',
      '................................', '................................', '................................', '................................',
      '................................', '................................', '................................', '................................',
      '................................', '................................', '................................', '................................',
    ];
  }
  drawRows(ctx, rows, P, 0, 0);
}

/** Small UI glyph textures (resource icons, cursor). */
export function generateUI(scene: Phaser.Scene): void {
  const icons: Record<string, { rows: Rows; pal: Record<string, string> }> = {
    'icon-fund': { rows: ['..gggg..', '.gwwwwg.', 'gwgggwwg', 'gwgwwwwg', 'gwwwwgwg', 'gwwgggwg', '.gwwwwg.', '..gggg..'], pal: { g: '#2ec27e', w: '#c8ffe0' } },
    'icon-goodwill': { rows: ['.rr..rr.', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', '.rrrrrr.', '..rrrr..', '...rr...', '........'], pal: { r: '#ff5f5f' } },
    'icon-morale': { rows: ['...yy...', '...yy...', '.yyyyyy.', '.yyyyyy.', '...yy...', '...yy...', '...yy...', '...yy...'], pal: { y: '#f5d547' } },
    'icon-energy': { rows: ['....bb..', '...bb...', '..bb....', '.bbbbbb.', '...bbb..', '....bb..', '...bb...', '..bb....'], pal: { b: '#66aaff' } },
    'cursor': { rows: ['w.......', 'ww......', 'www.....', 'wwww....', 'www.....', 'ww......', 'w.......', '........'], pal: { w: '#ffffff' } },
    'icon-day': { rows: ['..wwww..', '.wwwwww.', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', '.wwwwww.', '..wwww..'], pal: { w: '#ffd27f' } },
    'bolt': { rows: ['....yyyy', '...yyyy.', '..yyyy..', '.yyyyyyy', '....yyy.', '...yyy..', '..yyy...', '.yy.....'], pal: { y: '#ffd27f' } },
  };
  // helicopter silhouette for the title screen (32x10)
  if (!scene.textures.exists('heli')) {
    const heli = scene.textures.createCanvas('heli', 32, 10)!;
    drawRows(heli.getContext(), [
      '....xxxxxxxxxxxxxxxxxxxxxxxx....',
      '..............xx................',
      '.....xxxxxxxxxxxxxxxxxxx........',
      'xxxxxxxxxxxxxxxxxxxxxxxxxx......',
      'xx..xxxxxxxxxxxxxxxxxxxxxxxx....',
      '.x...xxxxxxxxxxxxxxxxxxxxxx.....',
      '.xx....xxxxxxxxxxxxxxxxx........',
      '.........xx........xx...........',
      '.......xxxxxxxxxxxxxxxxx........',
      '................................',
    ], { x: '#1a1a22' }, 0, 0);
    heli.refresh();
  }
  for (const [key, def] of Object.entries(icons)) {
    if (scene.textures.exists(key)) continue;
    const tex = scene.textures.createCanvas(key, 8, 8)!;
    drawRows(tex.getContext(), def.rows, def.pal, 0, 0);
    tex.refresh();
  }
}
