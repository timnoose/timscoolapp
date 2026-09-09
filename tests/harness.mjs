// Shared Playwright harness for driving the game. Node 22 + playwright (installed as devDependency).
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { mkdirSync } from 'fs';

export async function startServer(port = 4173) {
  // reuse an already-running server if there is one
  try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) return { kill() {} }; } catch { /* not running */ }
  const proc = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', detached: false });
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try { const r = await fetch(`http://localhost:${port}/`); if (r.ok) return proc; } catch { /* wait */ }
  }
  proc.kill();
  throw new Error('server start timeout');
}

export async function openGame({ port = 4173, mobile = false, headless = true, url } = {}) {
  mkdirSync('tests/out', { recursive: true });
  const browser = await chromium.launch({ headless, executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu'] });
  const context = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1200, height: 720 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('GL Driver')) errors.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(url ?? `http://localhost:${port}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__heman && window.__heman.game && window.__heman.game.scene.isActive('Title'), null, { timeout: 15000 });
  await page.waitForTimeout(400);
  const api = {
    browser, context, page, errors,
    async press(key, hold = 70) {
      await page.keyboard.down(key);
      await page.waitForTimeout(hold);
      await page.keyboard.up(key);
      await page.waitForTimeout(60);
    },
    async hold(key, ms) { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); await page.waitForTimeout(80); },
    async shot(name) { await page.screenshot({ path: `tests/out/${name}.png` }); },
    async state() { return page.evaluate(() => JSON.parse(JSON.stringify(window.__heman.session.game.state))); },
    async scene(name) { return page.evaluate((n) => window.__heman.game.scene.isActive(n), name); },
    async sleeping(name) { return page.evaluate((n) => window.__heman.game.scene.isSleeping(n), name); },
    async ui() {
      return page.evaluate(() => {
        const ui = window.__heman.game.scene.getScene('UI');
        const w = window.__heman.game.scene.getScene('World');
        return { blocking: ui.blocking || w.isTransitioning, inDialogue: ui.inDialogue, transitioning: w.isTransitioning };
      });
    },
    async world() {
      return page.evaluate(() => {
        const w = window.__heman.game.scene.getScene('World');
        return { map: w.map?.id, x: w.px, y: w.py, dir: w.dir };
      });
    },
    async teleport(map, x, y) {
      // wait for any transition to end first
      for (let i = 0; i < 60; i++) { const u = await api.ui(); if (!u.transitioning) break; await page.waitForTimeout(100); }
      await page.evaluate(([m, xx, yy]) => { window.__heman.game.scene.getScene('World').debugTeleport(m, xx, yy); }, [map, x, y]);
      await page.waitForTimeout(300);
    },
    async waitDialogue(timeout = 5000) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) { const u = await api.ui(); if (u.inDialogue) return true; await page.waitForTimeout(60); }
      return false;
    },
    async startNewGame() {
      await api.press('Space');
      await api.waitDialogue(6000);
    },
    async setState(fn) { await page.evaluate(fn); },
    /** Press A repeatedly until no dialogue is active (max n presses). */
    async skipDialogue(max = 60, key = 'Space') {
      for (let i = 0; i < max; i++) {
        const u = await api.ui();
        if (!u.inDialogue) return true;
        await api.press(key, 40);
        await page.waitForTimeout(40);
      }
      return false;
    },
    async close() { await browser.close(); },
  };
  return api;
}
