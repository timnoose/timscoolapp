/**
 * Retro UI helpers: pixel boxes, text, meters. All drawn at native resolution (400x240).
 */
import Phaser from 'phaser';

export const FONT = "'PressStart', 'Press Start 2P', monospace";
export const COLORS = {
  boxBg: 0x1a2038,
  boxBorder: 0xf4f4f0,
  boxInner: 0x5a6a9a,
  text: '#f4f4f0',
  dim: '#9aa0b8',
  accent: '#ffd27f',
  good: '#7ce0a0',
  bad: '#ff7a7a',
  blue: '#7fb8ff',
};

export function text(scene: Phaser.Scene, x: number, y: number, str: string, opts: { color?: string; size?: number; wrap?: number; align?: string; shadow?: boolean } = {}): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${opts.size ?? 8}px`,
    color: opts.color ?? COLORS.text,
    align: opts.align ?? 'left',
    wordWrap: opts.wrap ? { width: opts.wrap, useAdvancedWrap: false } : undefined,
    resolution: 1,
  });
  t.setLineSpacing(4);
  if (opts.shadow !== false) t.setShadow(1, 1, '#000000', 0, false, true);
  return t;
}

/** Classic double-bordered box. */
export function box(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, opts: { bg?: number; border?: number; inner?: number; alpha?: number } = {}): void {
  const bg = opts.bg ?? COLORS.boxBg;
  const border = opts.border ?? COLORS.boxBorder;
  const inner = opts.inner ?? COLORS.boxInner;
  g.fillStyle(border, opts.alpha ?? 1);
  g.fillRect(x + 1, y, w - 2, h);
  g.fillRect(x, y + 1, w, h - 2);
  g.fillStyle(inner, opts.alpha ?? 1);
  g.fillRect(x + 2, y + 2, w - 4, h - 4);
  g.fillStyle(bg, opts.alpha ?? 1);
  g.fillRect(x + 3, y + 3, w - 6, h - 6);
}

export function meter(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, frac: number, color: number, bg = 0x101018): void {
  g.fillStyle(0xf4f4f0, 1);
  g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(bg, 1);
  g.fillRect(x, y, w, h);
  const f = Math.max(0, Math.min(1, frac));
  if (f > 0) {
    g.fillStyle(color, 1);
    g.fillRect(x, y, Math.max(1, Math.round(w * f)), h);
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(x, y, Math.max(1, Math.round(w * f)), 1);
  }
}

export { money } from './format';

/** Wrap a string into lines that fit `chars` characters (monospace font). */
export function wrap(str: string, chars: number): string[] {
  const out: string[] = [];
  for (const para of str.split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      if (w.length > chars) {
        if (line) { out.push(line); line = ''; }
        for (let i = 0; i < w.length; i += chars) out.push(w.slice(i, i + chars));
        continue;
      }
      if ((line + (line ? ' ' : '') + w).length > chars) { out.push(line); line = w; }
      else line = line ? line + ' ' + w : w;
    }
    out.push(line);
  }
  return out;
}
