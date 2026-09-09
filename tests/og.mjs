// Captures the title screen as a 1200x630 Open Graph image (public/og.png) for link previews.
import { startServer, openGame } from './harness.mjs';
import { mkdirSync } from 'fs';
const server = await startServer();
const g = await openGame({ port: 4173 });
const { page } = g;
await page.setViewportSize({ width: 1200, height: 720 });
await page.waitForTimeout(1200); // logo entrance + first flyover not yet
mkdirSync('public', { recursive: true });
const canvas = await page.$('#game canvas');
const b = await canvas.boundingBox();
// crop the middle 630px band of the 720px-tall canvas
await page.screenshot({ path: 'public/og.png', clip: { x: b.x, y: b.y + 36, width: 1200, height: 630 } });
await page.screenshot({ path: 'tests/out/title-new.png' });
console.log('wrote public/og.png', b);
await g.close(); server.kill();
