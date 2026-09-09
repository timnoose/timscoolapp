import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
page.on('console', (m) => { if (m.text().includes('DBG')) console.log('console:', m.text()); });
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
const probe = () => page.evaluate(() => { const w = window.__heman.game.scene.getScene('World'); return { moving: w.moving, busy: w.busy, ready: w.ready, px: w.px, py: w.py, sx: w.player.x, sy: w.player.y, tweens: w.tweens.getTweens().length, pressed: [...window.__heman.input.pressed], down: [...window.__heman.input.down] }; });
console.log('before', await probe());
await page.keyboard.down('ArrowUp');
await page.waitForTimeout(30);
console.log('during hold', await probe());
await page.waitForTimeout(60);
await page.keyboard.up('ArrowUp');
await page.waitForTimeout(400);
console.log('after move', await probe());
// instrument update
await page.evaluate(() => { const w = window.__heman.game.scene.getScene('World'); const orig = w.update.bind(w); let n = 0; w.update = (t, d) => { const p = [...window.__heman.input.pressed]; if (p.length) console.log('DBG world.update sees pressed=' + p.join(',') + ' busy=' + w.busy + ' moving=' + w.moving); orig(t, d); }; const ui = window.__heman.game.scene.getScene('UI'); const ou = ui.update.bind(ui); ui.update = (t, d) => { const p = [...window.__heman.input.pressed]; if (p.length) console.log('DBG ui.update sees pressed=' + p.join(',')); ou(t, d); }; });
await page.keyboard.down('Space'); await page.waitForTimeout(50); await page.keyboard.up('Space'); await page.waitForTimeout(300);
console.log('after space', await probe(), await g.ui());
await g.close(); server.kill();
