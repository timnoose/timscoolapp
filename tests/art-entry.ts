import { TILES } from '../src/art/tiles';
export function checkAll(): string[] {
  const errs: string[] = [];
  for (const [name, t] of Object.entries(TILES)) {
    if (t.rows.length !== 16) errs.push(`tile ${name}: ${t.rows.length} rows`);
    t.rows.forEach((r, i) => { if (r.length !== 16) errs.push(`tile ${name} row ${i}: width ${r.length} -> "${r}"`); });
  }
  return errs;
}
export function summary() { return `${Object.keys(TILES).length} tiles`; }
import { buildCharacter } from '../src/art/characters';
export function checkChars(): string[] {
  const errs: string[] = [];
  const c = buildCharacter({ skin: '#c8a070', hair: '#222', shirt: '#800', pants: '#333', hairStyle: 'cap', beard: true, glasses: true, vest: true, tattoo: true });
  c.frames.forEach((f, i) => {
    if (f.length !== 24) errs.push(`char frame ${i}: ${f.length} rows`);
    f.forEach((r, y) => { if (r.length !== 16) errs.push(`char frame ${i} row ${y}: width ${r.length}`); });
  });
  return errs;
}
import { buildPortrait, MOODS } from '../src/art/portraits';
export function checkPortraits(): string[] {
  const errs: string[] = [];
  for (const mood of MOODS) {
    const p = buildPortrait({ skin: '#c8a070', hair: '#222', shirt: '#800', hairStyle: 'cap', beard: true, glasses: true, earrings: true }, mood);
    if (p.rows.length !== 32) errs.push(`portrait ${mood}: ${p.rows.length} rows`);
    p.rows.forEach((r, y) => { if (r.length !== 32) errs.push(`portrait ${mood} row ${y}: width ${r.length}`); });
  }
  return errs;
}
import { MAPS } from '../src/data/maps';
import { CAST } from '../src/data/cast';
export function checkMaps(): string[] {
  const errs: string[] = [];
  for (const [id, m] of Object.entries(MAPS)) {
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const g = m.ground[y][x]; const o = m.objects[y][x];
      if (g && !TILES[g]) errs.push(`map ${id}: unknown ground tile ${g} at ${x},${y}`);
      if (o && !TILES[o]) errs.push(`map ${id}: unknown object tile ${o} at ${x},${y}`);
    }
    if (!TILES[m.fill]) errs.push(`map ${id}: unknown fill ${m.fill}`);
    for (const n of m.npcs) if (!CAST[n.id]) errs.push(`map ${id}: unknown npc ${n.id}`);
    for (const d of m.doors) if (!MAPS[d.to.map]) errs.push(`map ${id}: door to unknown map ${d.to.map}`);
  }
  return errs;
}
