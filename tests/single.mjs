import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame({ url: 'http://localhost:4173/single-test/' });
await g.shot('single-title');
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await g.page.waitForTimeout(40); }
await g.hold('ArrowDown', 900); await g.page.waitForTimeout(900);
console.log('world', await g.world(), 'errors', g.errors);
await g.shot('single-church');
await g.close(); server.kill();
