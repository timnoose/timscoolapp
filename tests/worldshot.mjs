// Visual check for the guidance layer and living world: marker, map tab, cars, rain.
import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame();
const { page } = g;
await g.startNewGame();
for (let i = 0; i < 20; i++) { const u = await g.ui(); if (!u.inDialogue) break; await g.press('Space', 40); await page.waitForTimeout(40); }
// 1) marker in the office pointing at the desk / door
await page.waitForTimeout(300); await g.shot('wld-1-office-marker');
// 2) intro active: marker should route office -> church door
await page.evaluate(() => { const gm = window.__heman.session.game; gm.setQuest('intro', { status: 'active', stage: 0 }); });
await page.waitForTimeout(300); await g.shot('wld-2-office-to-kyle');
// 3) in church: marker over Kyle (far -> edge arrow), then close
await g.teleport('church', 4, 4); await page.waitForTimeout(400); await g.shot('wld-3-church-edge');
await g.teleport('church', 13, 13); await page.waitForTimeout(400); await g.shot('wld-4-church-kyle');
// 4) hvac: marker points to the coffee shop from town
await page.evaluate(() => { const gm = window.__heman.session.game; gm.setQuest('intro', { status: 'done', stage: 0 }); gm.setQuest('hvac', { status: 'active', stage: 0 }); });
await g.teleport('town', 21, 22); await page.waitForTimeout(400); await g.shot('wld-5-town-to-coffee');
// 5) stand in the road and wait for a car to brake + honk
await g.teleport('town', 24, 19); await page.waitForTimeout(200);
await page.evaluate(() => { const w = window.__heman.game.scene.getScene('World'); w.nextCar = 1e12; w.spawnCar('h', 1); });
let honks = 0; let carSeen = false;
for (let i = 0; i < 80; i++) {
  await page.waitForTimeout(250);
  const info = await page.evaluate(() => { const w = window.__heman.game.scene.getScene('World'); return { cars: w.cars.length, v: w.cars[0]?.v ?? -1, x: w.cars[0]?.spr.x, y: w.cars[0]?.spr.y, honks: window.__heman.session.game.state.stats.honks ?? 0 }; });
  if (info.cars > 0 && !carSeen) { carSeen = true; console.log('car spawned', info); }
  if (info.cars > 0 && info.x !== undefined && info.x > 18 * 16 && info.x < 22 * 16) { await g.shot('wld-6-car-braking'); }
  if (info.honks > honks) { honks = info.honks; console.log('honked', info); await g.shot('wld-7-car-honk'); break; }
}
console.log('carSeen', carSeen, 'honks', honks);
// 6) map tab
await g.press('Escape'); await page.waitForTimeout(200);
for (let i = 0; i < 4; i++) { await g.press('ArrowRight'); await page.waitForTimeout(120); }
await page.waitForTimeout(300); await g.shot('wld-8-map-tab');
await g.press('ArrowRight'); await page.waitForTimeout(200); await g.shot('wld-9-system-tab');
await g.press('Escape'); await page.waitForTimeout(200);
// 7) rain
await page.evaluate(() => { window.__heman.session.game.set('rainToday', true); });
await g.teleport('town', 22, 30); await page.waitForTimeout(900); await g.shot('wld-10-rain');
// 8) birds: force a flock
await page.evaluate(() => { window.__heman.session.game.set('rainToday', false); });
await g.teleport('town', 22, 30); await page.waitForTimeout(300);
await page.evaluate(() => { const w = window.__heman.game.scene.getScene('World'); w.nextBirds = 0; });
await page.waitForTimeout(1200); await g.shot('wld-11-birds');
const birds = await page.evaluate(() => window.__heman.game.scene.getScene('World').birds.length);
console.log('birds', birds, 'errors', g.errors);
await g.close(); server.kill();
