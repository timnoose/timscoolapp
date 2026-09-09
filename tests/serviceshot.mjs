import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.evaluate(() => { const s = window.__heman.session.game.state; s.morale = 80; s.goodwill = 70; s.allies = ['ronnie','pruitt','gary','linda']; s.flags.reyesTalked = true; });
await g.teleport('church', 12, 3); await page.waitForTimeout(200);
await g.press('ArrowUp', 40); await page.waitForTimeout(120); await g.press('Space', 40); await page.waitForTimeout(300);
let shot = 0; let lastCrowd = 0;
for (let i = 0; i < 60; i++) {
  const n = await page.evaluate(() => window.__heman.game.scene.getScene('UI').choiceCount);
  const crowd = await page.evaluate(() => window.__heman.game.scene.getScene('World').crowd.length);
  if (crowd > 0 && crowd !== lastCrowd) { await page.waitForTimeout(900); await g.shot(`svc-${++shot}`); lastCrowd = crowd; }
  if (n > 0) { await page.waitForTimeout(200); await g.shot(`svc-${++shot}-choice`); await g.press('Space', 40); await page.waitForTimeout(400); continue; }
  const u = await g.ui(); if (!u.inDialogue) break;
  if (crowd > 0 && i % 3 === 0) { await page.waitForTimeout(300); await g.shot(`svc-${++shot}`); }
  await g.press('Space', 40); await page.waitForTimeout(250);
}
const st = await g.state();
console.log('attendance', st.flags.attendance, 'fund', st.fund, 'morale', st.morale, 'stats', st.stats, 'errors', g.errors);
await g.close(); server.kill();
