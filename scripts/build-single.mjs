// Builds a single self-contained HTML file (game code inlined, Phaser + font from CDNs).
// Usage: node scripts/build-single.mjs [outfile]
// Useful for hosts that only accept one HTML file (e.g. an artifact page).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const out = process.argv[2] ?? 'dist/he-erik-man-quest.html';
const PHASER_VERSION = JSON.parse(readFileSync('node_modules/phaser/package.json', 'utf8')).version;

const r = await build({
  entryPoints: ['src/main.ts'],
  bundle: true, minify: true, format: 'iife', write: false,
  alias: { phaser: './scripts/phaser-global.js' },
  logLevel: 'error',
});
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const html = `<title>He-Erik-Man Quest</title>
<meta property="og:title" content="He-Erik-Man Quest: Building Edition">
<meta property="og:description" content="A retro pixel RPG: keep the warehouse church running, win over Clarksville, and finally get Harvest Church Ft. Campbell a building.">
<meta property="og:image" content="https://timnoose.github.io/timscoolapp/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block">
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #101018; color: #f4f4f0;
    font-family: 'Press Start 2P', 'PressStart', monospace; overflow: hidden;
    -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; touch-action: none; overscroll-behavior: none; }
  #app { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #101018; }
  #game { position: relative; flex: 0 0 auto; }
  #game canvas { image-rendering: pixelated; image-rendering: crisp-edges; display: block; margin: 0 auto; }
  #touch { display: none; position: fixed; left: 0; right: 0; bottom: 0; height: 190px; pointer-events: none; padding-bottom: env(safe-area-inset-bottom); }
  body.touch #touch { display: block; }
  .tbtn { position: absolute; pointer-events: auto; width: 52px; height: 52px; background: rgba(255,255,255,0.12);
    border: 2px solid rgba(255,255,255,0.35); border-radius: 10px; color: #fff; font-size: 12px; line-height: 48px; text-align: center; -webkit-tap-highlight-color: transparent; }
  .tbtn:active, .tbtn.on { background: rgba(255,255,255,0.35); }
  #t-up { left: 66px; bottom: 120px; } #t-down { left: 66px; bottom: 12px; } #t-left { left: 12px; bottom: 66px; } #t-right { left: 120px; bottom: 66px; }
  #t-a { right: 16px; bottom: 60px; width: 64px; height: 64px; border-radius: 32px; line-height: 60px; font-size: 14px; }
  #t-b { right: 90px; bottom: 24px; width: 56px; height: 56px; border-radius: 28px; line-height: 52px; }
  #t-menu { right: 16px; bottom: 140px; width: 64px; height: 30px; line-height: 26px; font-size: 9px; border-radius: 6px; }
  #nojs { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 11px; line-height: 1.8; color: #9aa0b8; }
  #rotate { display: none; position: absolute; left: 50%; transform: translateX(-50%); top: 260px; width: calc(100% - 28px); padding: 10px 12px; max-width: 360px; box-sizing: border-box; z-index: 5; background: #1a1a2a; border: 2px solid #f4f4f0; border-radius: 8px;
    font-family: 'Press Start 2P', 'PressStart', monospace; font-size: 8px; line-height: 1.7; color: #f4f4f0; text-align: center; pointer-events: auto; }
  #rotate b { color: #ffd27f; }
  #rotate span { display: block; margin-top: 6px; color: #9aa0b8; font-size: 7px; }
  body.touch #rotate.show { display: block; }
</style>
<div id="app"><div id="game"></div><div id="rotate"><b>&#8635; Tip:</b> turn your phone sideways. The game plays best in landscape.<span>tap to dismiss</span></div></div>
<div id="touch">
  <div class="tbtn" id="t-up" data-key="up">&#9650;</div>
  <div class="tbtn" id="t-left" data-key="left">&#9664;</div>
  <div class="tbtn" id="t-right" data-key="right">&#9654;</div>
  <div class="tbtn" id="t-down" data-key="down">&#9660;</div>
  <div class="tbtn" id="t-a" data-key="a">A</div>
  <div class="tbtn" id="t-b" data-key="b">B</div>
  <div class="tbtn" id="t-menu" data-key="menu">MENU</div>
</div>
<div id="nojs">Loading He-Erik-Man Quest...<br>If this stays here, the game engine could not load. Check your connection and reload.</div>
<script src="https://cdn.jsdelivr.net/npm/phaser@${PHASER_VERSION}/dist/phaser.min.js"></script>
<script>if (!window.Phaser) document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/${PHASER_VERSION}/phaser.min.js"><\\/script>');</script>
<script>
if (window.Phaser) { document.getElementById('nojs').remove(); }
${js}
</script>
`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB, Phaser ${PHASER_VERSION} from CDN)`);
