import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
await g.press('ArrowUp'); await page.waitForTimeout(200);
const info = await page.evaluate(() => {
  const w = window.__heman.game.scene.getScene('World');
  const ui = window.__heman.game.scene.getScene('UI');
  const out = { interacts: w.map.interacts.length, pos: [w.px, w.py, w.dir], obj: w.map.objects[2][4], busy: w.busy, uiBlocking: ui.blocking };
  try { w.interact(); out.afterInteract = ui.inDialogue; } catch (e) { out.err = String(e); }
  out.steps = ui.steps && ui.steps.length;
  return out;
});
console.log(info);
await page.waitForTimeout(200);
console.log('ui', await g.ui());
// now test key press path
await page.evaluate(() => { const ui = window.__heman.game.scene.getScene('UI'); ui.dialogueActive = false; ui.dlgContainer.setVisible(false); });
await page.evaluate(() => { window.__heman.input.onAnyInput.push(() => console.log('INPUT EVENT')); });
page.on('console', (m) => { if (m.text().includes('INPUT') || m.text().includes('DBG')) console.log('console:', m.text()); });
await page.evaluate(() => { const orig = window.__heman.input.consume.bind(window.__heman.input); window.__heman.input.consume = (k) => { const r = orig(k); if (r) console.log('DBG consumed ' + k); return r; }; });
await g.press('Space', 40); await page.waitForTimeout(300);
console.log('ui after key', await g.ui(), 'errors', g.errors);
await g.close(); server.kill();
