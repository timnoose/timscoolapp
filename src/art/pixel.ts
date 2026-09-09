/**
 * Tiny pixel-art DSL.
 * A sprite is an array of strings; each character is a palette key.
 * '.' is transparent. Palettes map characters to CSS colors.
 */
export type Palette = Record<string, string>;
export type Rows = string[];

export interface PixelSprite {
  rows: Rows;
  palette: Palette;
}

export function flipH(rows: Rows): Rows {
  return rows.map((r) => r.split('').reverse().join(''));
}

/** Overlay `top` onto `base` (same size). '.' in top is transparent. */
export function overlay(base: Rows, top: Rows): Rows {
  return base.map((row, y) => {
    const t = top[y] ?? '';
    let out = '';
    for (let x = 0; x < row.length; x++) {
      const c = t[x];
      out += c && c !== '.' ? c : row[x];
    }
    return out;
  });
}

/** Replace characters in rows according to a map. */
export function remap(rows: Rows, map: Record<string, string>): Rows {
  return rows.map((r) => r.split('').map((c) => map[c] ?? c).join(''));
}

/** Shift rows by dx,dy inside the same bounds (fills with '.'). */
export function shift(rows: Rows, dx: number, dy: number): Rows {
  const h = rows.length;
  const w = rows[0].length;
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let line = '';
    for (let x = 0; x < w; x++) {
      const sx = x - dx;
      const sy = y - dy;
      line += sy >= 0 && sy < h && sx >= 0 && sx < w ? rows[sy][sx] : '.';
    }
    out.push(line);
  }
  return out;
}

export function blank(w: number, h: number): Rows {
  return Array.from({ length: h }, () => '.'.repeat(w));
}

/** Draw a sprite into a 2D canvas context at (ox, oy). */
export function drawRows(ctx: CanvasRenderingContext2D, rows: Rows, palette: Palette, ox: number, oy: number, scale = 1): void {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.' || c === ' ') continue;
      const color = palette[c];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
    }
  }
}

/** Simple deterministic pseudo random (for textured tiles). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Fill a w x h block with a base char and scatter `count` speckles of other chars. */
export function textured(w: number, h: number, base: string, speckles: string[], count: number, seed: number): Rows {
  const rnd = seeded(seed);
  const grid: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => base));
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rnd() * w);
    const y = Math.floor(rnd() * h);
    grid[y][x] = speckles[Math.floor(rnd() * speckles.length)];
  }
  return grid.map((r) => r.join(''));
}

/** Validate that every row is the expected width (helps catch typos in art). */
export function assertSize(name: string, rows: Rows, w: number, h: number): void {
  if (rows.length !== h) throw new Error(`Art ${name}: expected ${h} rows, got ${rows.length}`);
  rows.forEach((r, i) => {
    if (r.length !== w) throw new Error(`Art ${name}: row ${i} has width ${r.length}, expected ${w}`);
  });
}
