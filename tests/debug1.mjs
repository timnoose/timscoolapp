import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
await g.startNewGame();
console.log('after start', await g.ui(), await g.world());
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
await page.waitForTimeout(300);
console.log('after intro', await g.ui(), await g.world(), (await g.state()).quests);
await g.press('ArrowUp'); await page.waitForTimeout(200);
console.log('after up', await g.world());
await g.press('ArrowUp', 40); await page.waitForTimeout(120);
console.log('after face', await g.world());
await g.press('Space', 40); await page.waitForTimeout(300);
console.log('after space', await g.ui(), await g.world());
await g.shot('dbg-desk');
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
console.log('flags', (await g.state()).flags, 'errors', g.errors);
await g.close(); server.kill();
