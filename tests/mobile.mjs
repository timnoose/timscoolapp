// Mobile viewport: touch controls visible, tapping works, portrait layout readable.
import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const failures = [];
const check = (c, m) => { if (!c) { failures.push(m); console.log('FAIL:', m); } else console.log('ok:', m); };
let g;
try {
  g = await openGame({ mobile: true });
  const { page } = g;
  await page.waitForTimeout(300);
  const touchVisible = await page.evaluate(() => document.body.classList.contains('touch') && getComputedStyle(document.getElementById('touch')).display !== 'none');
  check(touchVisible, 'touch controls shown on mobile');
  const tipShown = () => page.evaluate(() => getComputedStyle(document.getElementById('rotate')).display !== 'none');
  check(await tipShown(), 'landscape tip shown in portrait');
  await g.shot('m01-title');
  const tap = async (id, hold = 80) => {
    const el = await page.$(`#${id}`);
    const box = await el.boundingBox();
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.touchscreen.tap(x, y);
    await page.waitForTimeout(hold);
  };
  // start game with A button
  await tap('t-a'); await page.waitForTimeout(1500);
  check(await g.scene('World'), 'A button starts the game');
  for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await tap('t-a', 120); }
  await g.shot('m02-office');
  const before = await g.world();
  // hold the up d-pad via pointer events
  const el = await page.$('#t-up'); const b = await el.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x + b.width / 2, y: b.y + b.height / 2 }] });
  await page.waitForTimeout(400);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(300);
  const after = await g.world();
  check(after.y < before.y, `d-pad moves the player (${before.y} -> ${after.y})`);
  await tap('t-a'); await page.waitForTimeout(500);
  check((await g.ui()).inDialogue, 'A button interacts with the desk');
  await g.shot('m03-dialogue');
  for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await tap('t-a', 120); }
  await tap('t-menu'); await page.waitForTimeout(300);
  check(await page.evaluate(() => window.__heman.game.scene.getScene('UI').menuIsOpen), 'MENU button opens the journal');
  await g.shot('m04-menu');
  await tap('t-b'); await page.waitForTimeout(300);
  check(!(await page.evaluate(() => window.__heman.game.scene.getScene('UI').menuIsOpen)), 'B button closes the journal');
  // landscape
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);
  await g.shot('m05-landscape');
  check(!(await tipShown()), 'landscape tip hidden in landscape');
  // back to portrait: tapping the tip dismisses it and it stays dismissed
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  check(await tipShown(), 'landscape tip returns in portrait');
  await tap('rotate'); await page.waitForTimeout(200);
  check(!(await tipShown()), 'tapping the tip dismisses it');
  console.log('errors', g.errors);
  check(g.errors.length === 0, 'no console errors (mobile)');
} catch (e) { console.error('EXCEPTION', e); failures.push(String(e)); }
finally { await g?.close(); server.kill(); }
console.log(failures.length ? `${failures.length} FAILURES` : 'ALL MOBILE CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
