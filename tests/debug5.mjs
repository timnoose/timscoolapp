import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
page.on('console', (m) => { if (m.text().includes('DBG')) console.log('console:', m.text().replace(/\n/g, ' | ').slice(0, 400)); });
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
console.log('scene order', await page.evaluate(() => window.__heman.game.scene.scenes.map((s) => s.scene.key + ':' + s.scene.settings.status)));
await page.evaluate(() => {
  let frame = 0; let logged = 0;
  const inp = window.__heman.input;
  const w = window.__heman.game.scene.getScene('World');
  const ui = window.__heman.game.scene.getScene('UI');
  const ow = w.update.bind(w); w.update = (t, d) => { if (inp.pressed.size || logged) { console.log('DBG f' + frame + ' World.update pressed=' + [...inp.pressed]); logged = 4; } ow(t, d); };
  const ou = ui.update.bind(ui); ui.update = (t, d) => { if (inp.pressed.size || logged) { console.log('DBG f' + frame + ' UI.update pressed=' + [...inp.pressed]); logged--; } ou(t, d); };
  window.__heman.game.events.on('step', () => { frame++; });
  const origPress = inp.press.bind(inp);
  inp.press = (k) => { origPress(k); console.log('DBG f' + frame + ' press ' + k); };
  const origEnd = inp.endFrame.bind(inp);
  inp.endFrame = () => { if (inp.pressed.size) console.log('DBG f' + frame + ' endFrame clears ' + [...inp.pressed] + ' from ' + new Error().stack.split('\n')[2]); origEnd(); };
});
await page.keyboard.down('Space'); await page.waitForTimeout(50); await page.keyboard.up('Space'); await page.waitForTimeout(300);
await g.close(); server.kill();
