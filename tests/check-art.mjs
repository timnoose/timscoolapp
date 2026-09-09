// Validates all pixel art dimensions. Usage: node tests/check-art.mjs
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'fs';
mkdirSync('tests/out', { recursive: true });
await build({
  entryPoints: ['tests/art-entry.ts'],
  bundle: true, format: 'esm', platform: 'node', outfile: 'tests/out/art.mjs', logLevel: 'error',
});
const mod = await import('../tests/out/art.mjs?' + Date.now());
const errors = [...mod.checkAll(), ...mod.checkChars(), ...mod.checkPortraits(), ...mod.checkMaps()];
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('art OK:', mod.summary());
