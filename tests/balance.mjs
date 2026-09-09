import { build } from 'esbuild';
import { mkdirSync } from 'fs';
mkdirSync('tests/out', { recursive: true });
await build({ entryPoints: ['tests/balance-entry.ts'], bundle: true, format: 'esm', platform: 'node', outfile: 'tests/out/balance.mjs', logLevel: 'error' });
const mod = await import('../tests/out/balance.mjs?' + Date.now());
const lines = mod.simulate();
console.log(lines.join('\n'));
if (lines.some((l) => l.includes('!!'))) process.exit(1);
