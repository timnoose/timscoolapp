import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await g.page.waitForTimeout(40); }
await g.teleport('church', 14, 12); await g.page.waitForTimeout(400);
await g.shot('staff-church');
// talk to Richard
await g.teleport('church', 7, 16); await g.press('ArrowLeft', 40); await g.page.waitForTimeout(150); await g.press('Space', 40); await g.page.waitForTimeout(600);
await g.shot('staff-richard');
console.log('errors', g.errors);
await g.close(); server.kill();
