// Renders each map zoomed out to a single screenshot for layout review.
import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
for (const [map, zoom, x, y] of [['town', 0.5, 25, 20], ['church', 1, 12, 10], ['coffee', 1, 7, 6], ['cityhall', 1, 9, 6], ['chapel', 1, 9, 7], ['campus', 1, 11, 7]]) {
  await g.teleport(map, x, y);
  await page.evaluate(([z]) => {
    const w = window.__heman.game.scene.getScene('World');
    const cam = w.cameras.main; cam.setZoom(z); cam.setBounds(-2000, -2000, 5000, 5000); cam.centerOn(w.player.x, w.player.y);
    window.__heman.game.scene.getScene('UI').scene.setVisible(false);
  }, [zoom]);
  await page.waitForTimeout(300);
  await g.shot(`map-${map}`);
}
await g.close(); server.kill();
