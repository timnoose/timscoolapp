import { startServer, openGame } from './harness.mjs';
const server = await startServer();
const g = await openGame({ mobile: true });
await g.page.waitForTimeout(500);
const info = await g.page.evaluate(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const app = document.getElementById('app'), game = document.getElementById('game'), canvas = document.querySelector('#game canvas');
  return { touch: document.body.classList.contains('touch'), appJustify: getComputedStyle(app).justifyContent, appPad: app.style.paddingTop, app: r(app), game: r(game), canvas: r(canvas), canvasStyle: { ml: canvas.style.marginLeft, mt: canvas.style.marginTop, w: canvas.style.width, h: canvas.style.height }, inner: [innerWidth, innerHeight] };
});
console.log(JSON.stringify(info, null, 1));
await g.close(); server.kill();
