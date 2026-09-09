import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
page.on('console', (m) => { if (m.text().includes('DBG')) console.log('console:', m.text().slice(0, 600)); });
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
console.log('active scenes', await page.evaluate(() => window.__heman.game.scene.getScenes(true).map((s) => s.scene.key)));
await page.evaluate(() => {
  const inp = window.__heman.input;
  const origEnd = inp.endFrame.bind(inp);
  inp.endFrame = () => { if (inp.pressed.size) console.log('DBG endFrame clearing ' + [...inp.pressed] + '\n' + new Error().stack.split('\n').slice(1, 5).join(' | ')); origEnd(); };
  const origClear = inp.clear.bind(inp);
  inp.clear = () => { if (inp.pressed.size) console.log('DBG clear() clearing ' + [...inp.pressed] + '\n' + new Error().stack.split('\n').slice(1, 5).join(' | ')); origClear(); };
  const origPress = inp.press.bind(inp);
  inp.press = (k) => { origPress(k); console.log('DBG press ' + k + ' pressed=' + [...inp.pressed]); };
});
await page.keyboard.down('Space'); await page.waitForTimeout(50); await page.keyboard.up('Space'); await page.waitForTimeout(300);
console.log('ui', await g.ui());
await g.close(); server.kill();
