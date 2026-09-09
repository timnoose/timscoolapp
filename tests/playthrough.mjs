/**
 * Full automated playthrough through the real UI. Verifies: quests, encounters, resources,
 * both endings, save/load, menu, lose/retry. Run: node tests/playthrough.mjs
 */
import { startServer, openGame } from './harness.mjs';

const server = await startServer();
const failures = [];
const check = (cond, msg) => { if (!cond) { failures.push(msg); console.log('FAIL:', msg); } else console.log('ok:', msg); };

let g;
try {
  g = await openGame();
  const { page } = g;

  async function faceAndTalk(dir) {
    await g.press(dir, 40);
    await page.waitForTimeout(120);
    await g.press('Space', 40);
    await page.waitForTimeout(250);
  }
  async function choose(idx) {
    // wait for a choice menu
    for (let i = 0; i < 80; i++) {
      const n = await page.evaluate(() => window.__heman.game.scene.getScene('UI').choiceCount);
      if (n > 0) break;
      const u = await g.ui();
      if (!u.inDialogue && !(await g.scene('Encounter'))) break;
      await g.press('Space', 40); await page.waitForTimeout(40);
    }
    const count = await page.evaluate(() => window.__heman.game.scene.getScene('UI').choiceCount);
    if (!count) return;
    // try the requested option, then fall back to the others (an option may be disabled)
    const order = [idx, ...Array.from({ length: count }, (_, i) => i).filter((i) => i !== idx)];
    let cursor = 0;
    for (const want of order) {
      while (cursor !== want) { await g.press(cursor < want ? 'ArrowDown' : 'ArrowUp', 40); cursor += cursor < want ? 1 : -1; }
      await g.press('Space', 40);
      await page.waitForTimeout(150);
      const still = await page.evaluate(() => window.__heman.game.scene.getScene('UI').choiceCount);
      if (!still) return;
      console.log(`  (choice ${want} was disabled, trying another)`);
    }
  }
  /** Advance dialogue until it ends, auto-playing any encounter with best moves. Returns encounter results. */
  const shotDone = new Set();
  async function runUntilFree(opts = {}) {
    const results = [];
    for (let i = 0; i < 600; i++) {
      if (await g.scene('Encounter')) {
        const ph = await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugPhase);
        if (ph === 'menu') {
          const eid = await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugState.def.id);
          const listened = await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugState.listened);
          const key = eid + (listened ? '-b' : '-a');
          if (!shotDone.has(key)) { shotDone.add(key); await page.waitForTimeout(150); await g.shot(`enc-${key}`); }
          const idx = opts.moveIndex !== undefined ? opts.moveIndex : await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugBestMove());
          await page.evaluate((i) => window.__heman.game.scene.getScene('Encounter').debugChoose(i), idx);
          await page.waitForTimeout(150);
          // forced move unusable (out of energy)? fall back to the best available move
          const stillMenu = await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugPhase === 'menu');
          if (stillMenu && opts.moveIndex !== undefined) {
            const best = await page.evaluate(() => window.__heman.game.scene.getScene('Encounter').debugBestMove());
            await page.evaluate((i) => window.__heman.game.scene.getScene('Encounter').debugChoose(i), best);
            await page.waitForTimeout(150);
          }
        } else {
          await g.press('Space', 30);
          await page.waitForTimeout(30);
        }
        const res = await page.evaluate(() => window.__heman.session.game.state.flags.lastEncounter);
        if (res && !results.includes(res)) results.push(res);
        continue;
      }
      const u = await g.ui();
      const n = await page.evaluate(() => window.__heman.game.scene.getScene('UI').choiceCount);
      if (n > 0) { if (!shotDone.has('choice')) { shotDone.add('choice'); await page.waitForTimeout(150); await g.shot('30-choice'); } await choose(opts.choice ?? 0); opts.choice = 0; continue; }
      if (!u.inDialogue && !u.blocking) {
        // wait a bit for transitions (rest/warp) to settle
        await page.waitForTimeout(200);
        const u2 = await g.ui();
        if (!u2.inDialogue && !u2.blocking && !(await g.scene('Encounter'))) return results;
        continue;
      }
      await g.press('Space', 40);
      await page.waitForTimeout(40);
    }
    throw new Error('runUntilFree: stuck');
  }
  async function restViaCouch() {
    await g.teleport('office', 2, 5);
    await runUntilFree();
    await faceAndTalk('ArrowUp');
    await runUntilFree({ choice: 0 });
    await page.waitForTimeout(200);
    await runUntilFree();
    console.log('  (rested: day ' + (await g.state()).day + ', energy ' + (await g.state()).energy + ')');
  }
  async function talk(map, x, y, dir, opts = {}) {
    if (!opts.noRest && (await g.state()).energy < 70) await restViaCouch();
    await g.teleport(map, x, y);
    await page.waitForTimeout(150);
    await runUntilFree(); // any auto dialogue on entering
    await page.evaluate(() => window.__heman.session.game.state.flags.lastEncounter = '');
    await faceAndTalk(dir);
    return runUntilFree(opts);
  }
  const endingPhase = () => page.evaluate(() => { const e = window.__heman.game.scene.getScene('Ending'); return e && window.__heman.game.scene.isActive('Ending') ? e.debugPhase : 'none'; });
  async function finishEnding() {
    for (let i = 0; i < 200 && (await endingPhase()) === 'walk'; i++) await page.waitForTimeout(100);
    for (let i = 0; i < 200 && (await endingPhase()) === 'talk'; i++) { await g.press('Space', 30); await page.waitForTimeout(50); }
    await page.keyboard.down('Space');
    for (let i = 0; i < 300 && (await endingPhase()) === 'credits'; i++) await page.waitForTimeout(100);
    await page.keyboard.up('Space');
    await page.waitForTimeout(300);
    await g.press('Space'); await page.waitForTimeout(1500);
  }
  const flags = async () => (await g.state()).flags;
  const quest = async (id) => (await g.state()).quests[id] ?? { status: 'inactive', stage: 0 };

  // ---------- Start ----------
  await g.startNewGame();
  await runUntilFree();
  check((await quest('intro')).status === 'active', 'intro quest active after office intro');
  await g.press('ArrowUp'); await page.waitForTimeout(150);
  await faceAndTalk('ArrowUp'); await runUntilFree();
  check((await flags()).deskChecked === true, 'desk checked');
  // walk out through the office door for real
  await g.hold('ArrowDown', 900); await page.waitForTimeout(900);
  check((await g.world()).map === 'church', 'walked through office door into church');

  // ---------- Q1 HVAC ----------
  await talk('church', 13, 17, 'ArrowUp');
  check((await quest('hvac')).status === 'active', 'HVAC quest started via Kyle');
  await g.shot('10-town');
  // walk out the church exit mat to the town for real
  await g.teleport('church', 22, 17); await g.hold('ArrowDown', 250); await page.waitForTimeout(900);
  check((await g.world()).map === 'town', 'church exit mat leads to town');
  await g.shot('11-town-front');
  // walk into the church door for real
  await g.hold('ArrowUp', 250); await page.waitForTimeout(900);
  check((await g.world()).map === 'church', 'church front door works');
  // Dale encounter
  let r = await talk('coffee', 8, 4, 'ArrowUp', { choice: 1 }); // volunteer repair
  check(r.includes('win'), 'won Dale encounter: ' + r);
  check((await quest('hvac')).stage === 2, 'HVAC stage 2 after picking volunteer repair');
  check((await g.state()).allies.includes('ronnie'), 'Ronnie is an ally');
  await g.shot('12-coffee');
  await talk('church', 22, 2, 'ArrowUp');
  check((await quest('hvac')).status === 'done', 'HVAC quest done at thermostat');

  // ---------- Q2 Memorial ----------
  await g.teleport('town', 20, 29); await runUntilFree();
  check((await quest('memorial')).status === 'active', 'memorial quest auto-started in town');
  await talk('town', 6, 14, 'ArrowUp');
  check((await quest('memorial')).stage === 1, 'memorial stage 1 after Mrs. Pruitt');
  await talk('office', 7, 2, 'ArrowUp');
  check((await flags()).minutesRead === true, 'minutes read');
  await talk('coffee', 2, 10, 'ArrowUp');
  check((await quest('memorial')).stage === 2, 'memorial stage 2 after Harold + minutes');
  r = await talk('town', 6, 14, 'ArrowUp', { choice: 1 }); // garden
  check(r.includes('win'), 'won email thread: ' + r);
  check((await quest('memorial')).status === 'done', 'memorial done');
  check((await g.state()).allies.includes('pruitt') && (await g.state()).allies.includes('harold'), 'Pruitt and Harold allies');
  await g.teleport('town', 18, 28); await page.waitForTimeout(300);
  const benchTile = await page.evaluate(() => window.__heman.game.scene.getScene('World').tileAt(17, 27));
  check(benchTile === 'memorialBench', 'bench moved back to garden spot (map override): ' + benchTile);
  await g.shot('13-garden');

  // ---------- Q3 Neighbors ----------
  await runUntilFree();
  check((await quest('neighbor')).status === 'active', 'neighbor quest auto-started');
  const brief = async (label) => console.log(label, JSON.stringify((({ fund, goodwill, morale, energy, day }) => ({ fund, goodwill, morale, energy, day }))(await g.state())));
  await brief('before neighbors:');
  r = await talk('town', 7, 28, 'ArrowUp');
  check(r.includes('win'), 'won Gary: ' + r);
  await brief('after gary:');
  r = await talk('town', 40, 35, 'ArrowUp');
  check(r.includes('win'), 'won Linda: ' + r);
  await brief('after linda:');
  await talk('town', 39, 27, 'ArrowUp', { choice: 0 });
  check((await flags()).tonyaResolved === true, 'Tonya resolved');
  await talk('town', 26, 32, 'ArrowUp', { choice: 2 });
  check((await quest('neighbor')).status === 'done', 'neighbor quest done via block party');
  const st3 = await g.state();
  check(st3.goodwill >= 60, `goodwill ${st3.goodwill} >= 60 after neighbors`);

  // ---------- Q4 Campaign ----------
  await g.teleport('town', 20, 29); await runUntilFree();
  check((await quest('campaign')).status === 'active', 'campaign auto-started');
  r = await talk('cityhall', 9, 3, 'ArrowUp');
  check(r.includes('win'), 'won Bev (over the counter): ' + r);
  check((await flags()).eventPermit === true, 'event permit');
  await g.shot('14-cityhall');
  r = await talk('cityhall', 14, 4, 'ArrowUp');
  check(r.includes('win'), 'won grant form: ' + r);
  check((await flags()).grantDone === true, 'grant done');
  r = await talk('coffee', 12, 7, 'ArrowDown', { choice: 1 });
  check(r.includes('win'), 'won Whitlock: ' + r);
  check((await flags()).donorDone === true, 'donor done');
  // Wrestling: need $1200 + 20 energy. Ensure energy via state if needed.
  let s4 = await g.state();
  r = await talk('town', 26, 32, 'ArrowUp', { choice: 0 });
  check(r.includes('win'), 'won Harvest Slam: ' + r);
  check((await flags()).eventDone === true, 'event done');
  check((await quest('campaign')).status === 'done', 'campaign done');
  s4 = await g.state();
  console.log('after campaign:', { fund: s4.fund, goodwill: s4.goodwill, morale: s4.morale, energy: s4.energy, day: s4.day });

  // ---------- Q5 Elders ----------
  await g.teleport('church', 12, 10); await runUntilFree();
  check((await quest('elders')).status === 'active', 'elders auto-started in church');
  r = await talk('church', 10, 5, 'ArrowUp');
  check(r.includes('win'), 'won Doug: ' + r);
  r = await talk('church', 14, 5, 'ArrowUp');
  check(r.includes('win'), 'won Marcus: ' + r);
  r = await talk('church', 12, 7, 'ArrowUp');
  check(r.includes('win'), 'won Carpet: ' + r);
  check((await quest('elders')).stage === 3, 'elders stage 3 (decision)');
  await g.shot('15-elders-done');

  // ---------- Recovery loop: preach + rest until fund is enough ----------
  let loops = 0;
  while ((await g.state()).fund < 48000 && loops < 25) {
    loops++;
    const before = await g.state();
    if (before.energy >= 35 && !before.flags.preachedToday) {
      await talk('church', 12, 3, 'ArrowUp', { choice: 0, noRest: true });
      const after = await g.state();
      check(after.fund > before.fund, `preaching raised money (${before.fund} -> ${after.fund})`);
      // preaching twice the same day must not pay twice
      await talk('church', 12, 3, 'ArrowUp', { choice: 0, noRest: true });
      const after2 = await g.state();
      check(after2.fund === after.fund, 'no double offering on the same day');
    }
    await talk('office', 2, 5, 'ArrowUp', { choice: 0, noRest: true }); // couch -> rest
    await page.waitForTimeout(300);
    await runUntilFree();
  }
  const s5 = await g.state();
  console.log('random events seen:', s5.seenEvents);
  check(s5.seenEvents.length > 0, 'at least one random event fired during rests');
  console.log('after grind:', { fund: s5.fund, goodwill: s5.goodwill, morale: s5.morale, day: s5.day, loops });
  check(s5.fund >= 48000, 'fund reached buy threshold via recovery loop');

  // ---------- Menu + save/load ----------
  await g.teleport('town', 22, 30); await page.waitForTimeout(200);
  await g.press('Escape'); await page.waitForTimeout(200);
  await g.shot('16-menu-journal');
  await g.press('ArrowRight'); await page.waitForTimeout(150); await g.shot('17-menu-resources');
  await g.press('ArrowRight'); await page.waitForTimeout(150); await g.shot('18-menu-allies');
  await g.press('ArrowRight'); await page.waitForTimeout(150); await g.shot('18b-menu-awards');
  await g.press('ArrowRight'); await page.waitForTimeout(250); await g.shot('18c-menu-map');
  await g.press('ArrowRight'); await page.waitForTimeout(150); await g.shot('18d-menu-system');
  await g.press('Space'); await page.waitForTimeout(200); // save
  await g.press('Escape'); await page.waitForTimeout(200);
  check(!(await page.evaluate(() => window.__heman.game.scene.getScene('UI').menuIsOpen)), 'menu closes with Escape');
  const saved = await page.evaluate(() => localStorage.getItem('heerikman-quest-save'));
  check(!!saved && JSON.parse(saved).version === 4, 'save exists with version 4');
  // reload and continue
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__heman?.game?.scene?.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  await g.shot('19-title-continue');
  await g.press('Space'); await page.waitForTimeout(1500);
  for (let i = 0; i < 30; i++) { const u = await g.ui(); if (!u.transitioning) break; await page.waitForTimeout(100); }
  const w = await g.world();
  check(w.map === 'town' && w.x === 22 && w.y === 30, 'continue restores position: ' + JSON.stringify(w));
  check((await g.state()).fund === s5.fund, 'continue restores fund');

  // ---------- Ending: BUY ----------
  const snapshot = saved;
  await talk('town', 44, 11, 'ArrowUp', { choice: 0 });
  await page.waitForTimeout(2500);
  check(await g.scene('Ending'), 'Ending scene active after buying');
  await page.waitForTimeout(5500);
  await g.shot('20-ending-buy');
  await finishEnding();
  await g.shot('21-credits');
  check(await g.scene('Title'), 'back to title after buy ending');

  // ---------- Ending: BUILD (restore snapshot) ----------
  await page.evaluate((s) => localStorage.setItem('heerikman-quest-save', s), snapshot);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__heman?.game?.scene?.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  await g.press('Space'); await page.waitForTimeout(1500);
  await talk('town', 40, 37, 'ArrowUp', { choice: 0 });
  await page.waitForTimeout(2500);
  check(await g.scene('Ending'), 'Ending scene active after building');
  await page.waitForTimeout(5500);
  await g.shot('22-ending-build');
  await finishEnding();
  check(await g.scene('Title'), 'back to title after build ending');

  // ---------- Lose an encounter and retry ----------
  await page.evaluate(() => localStorage.removeItem('heerikman-quest-save'));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.__heman?.game?.scene?.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  await g.startNewGame(); await runUntilFree();
  await talk('church', 13, 17, 'ArrowUp');
  await page.evaluate(() => { window.__heman.session.game.state.energy = 25; });
  r = await talk('coffee', 8, 4, 'ArrowUp', { moveIndex: 1, noRest: true }); // spam Explain Vision (weak) until energy runs out
  check(r.includes('lose'), 'lost Dale on purpose: ' + r);
  const afterLose = await g.state();
  check(afterLose.energy >= 15, 'energy floor after losing: ' + afterLose.energy);
  check((await quest('hvac')).stage === 0, 'HVAC still at stage 0 after loss (retry allowed)');
  await page.evaluate(() => { window.__heman.session.game.state.energy = 100; });
  r = await talk('coffee', 8, 4, 'ArrowUp', { choice: 2 }); // retry, pick fans
  check(r.includes('win'), 'retry after loss works: ' + r);
  check((await flags()).hvacFans === true, 'fans path chosen');
  // sweaty Sunday encounter should trigger on first preach
  r = await talk('church', 12, 3, 'ArrowUp', { choice: 0 });
  check(r.includes('win') || r.includes('lose'), 'sweaty Sunday encounter triggered: ' + r);
  check((await flags()).sweatyDone === true, 'sweaty flag set');

  console.log('console errors:', g.errors);
  check(g.errors.length === 0, 'no console errors');
} catch (e) {
  console.error('EXCEPTION', e);
  failures.push('exception: ' + e.message);
  try { await g?.shot('99-exception'); } catch { /* ignore */ }
} finally {
  await g?.close();
  server.kill();
}
console.log(failures.length ? `\n${failures.length} FAILURES:\n- ` + failures.join('\n- ') : '\nALL CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
