import { chromium } from 'playwright';
const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1) + 's', ...a);
const browser = await chromium.launch({ headless: true, executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--disable-gpu'] });
log('browser launched');
const page = await browser.newPage({ viewport: { width: 1200, height: 720 } });
page.on('console', (m) => log('console', m.type(), m.text().slice(0, 200)));
page.on('pageerror', (e) => log('pageerror', e.message));
page.on('requestfailed', (r) => log('reqfail', r.url()));
await page.goto('http://localhost:4173/', { waitUntil: 'load', timeout: 20000 });
log('loaded');
for (let i = 0; i < 10; i++) {
  const st = await page.evaluate(() => ({ heman: !!window.__heman, title: window.__heman?.game?.scene?.isActive('Title'), boot: window.__heman?.game?.scene?.isActive('Boot') }));
  log('state', JSON.stringify(st));
  if (st.title) break;
  await page.waitForTimeout(500);
}
await page.screenshot({ path: 'tests/out/diag.png' });
log('shot');
await browser.close();
log('done');
