import { ENCOUNTERS } from '../src/data/encounters';
import { createEncounter, playerMove, effectivenessOf, canUse, type MoveId } from '../src/engine/encounter';
import { BALANCE } from '../src/data/balance';

function rng(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

export function simulate(): string[] {
  const out: string[] = [];
  for (const def of Object.values(ENCOUNTERS)) {
    const trials = 200;
    let wins = 0, turnsTotal = 0, energyLeft = 0;
    let smartLosses = 0;
    for (let t = 0; t < trials; t++) {
      const r = rng(t * 7919 + 13);
      const st = createEncounter(def, 100, false, 'Tim');
      let turns = 0;
      while (!st.over && turns < 30) {
        turns++;
        let move: MoveId;
        if (!st.listened) move = 'listen';
        else {
          const rank: Record<string, number> = { super: 4, good: 3, normal: 2, weak: 1, backfire: 0 };
          let best: MoveId = 'vision', bs = -1;
          for (const m of ['vision', 'coffee', 'volunteer', 'boundary', 'meeting'] as MoveId[]) {
            if (!canUse(st, m).ok) continue;
            const sc = rank[effectivenessOf(st, m)] + (m === 'coffee' && st.energy < 30 ? 1.5 : 0);
            if (sc > bs) { bs = sc; best = m; }
          }
          move = best;
        }
        if (!canUse(st, move).ok) move = canUse(st, 'coffee').ok ? 'coffee' : 'listen';
        playerMove(st, move, r);
      }
      if (st.over === 'win') { wins++; turnsTotal += turns; energyLeft += st.energy; } else smartLosses++;
    }
    // dumb strategy: spam the worst move
    let dumbWins = 0;
    for (let t = 0; t < 50; t++) {
      const r = rng(t * 31 + 7);
      const st = createEncounter(def, 60, false, 'Tim');
      let turns = 0;
      while (!st.over && turns < 30) { turns++; const m: MoveId = canUse(st, 'vision').ok ? 'vision' : 'coffee'; if (!canUse(st, m).ok) break; playerMove(st, m, r); }
      if (st.over === 'win') dumbWins++;
    }
    const line = `${def.id.padEnd(9)} smart win ${Math.round(100 * wins / trials)}% avg turns ${(turnsTotal / Math.max(1, wins)).toFixed(1)} energy left ${(energyLeft / Math.max(1, wins)).toFixed(0)} | spam-vision win ${Math.round(100 * dumbWins / 50)}%`;
    out.push(line);
    if (wins / trials < 0.9) out.push(`  !! ${def.id} too hard for a smart player`);
  }
  // economy sanity
  const minSunday = BALANCE.sundayBaseOffering + 0 * BALANCE.sundayMoralePerDollar;
  const maxRandomCost = 900;
  out.push(`economy: min Sunday offering ${minSunday} > max random expense ${maxRandomCost}: ${minSunday > maxRandomCost}`);
  return out;
}

/** Win rate of the listen-first strategy when entering with a low tank. */
export function lowEnergy(): string[] {
  const out: string[] = [];
  for (const start of [100, 70, 55, 40]) {
    const rates: string[] = [];
    for (const def of Object.values(ENCOUNTERS)) {
      let wins = 0; const trials = 300;
      for (let t = 0; t < trials; t++) {
        const r = rng(t * 977 + start);
        const st = createEncounter(def, start, false, 'Tim');
        let turns = 0;
        while (!st.over && turns < 30) {
          turns++;
          let move: MoveId = 'listen';
          if (st.listened) {
            const rank: Record<string, number> = { super: 4, good: 3, normal: 2, weak: 1, backfire: 0 };
            let best: MoveId | null = null, bs = -1;
            for (const m of ['vision', 'coffee', 'volunteer', 'boundary', 'meeting'] as MoveId[]) {
              if (!canUse(st, m).ok) continue;
              const sc = rank[effectivenessOf(st, m)] + (m === 'coffee' && st.energy < 30 ? 1.5 : 0);
              if (sc > bs) { bs = sc; best = m; }
            }
            move = best ?? (canUse(st, 'coffee').ok ? 'coffee' : 'listen');
          }
          if (!canUse(st, move).ok) break;
          playerMove(st, move, r);
        }
        if (st.over === 'win') wins++;
      }
      rates.push(`${def.id}:${Math.round(100 * wins / trials)}`);
    }
    out.push(`start ${start}: ${rates.join(' ')}`);
  }
  return out;
}
