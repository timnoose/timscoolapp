import { build } from 'esbuild';
await build({ entryPoints: ['tests/balance-entry.ts'], bundle: true, format: 'esm', platform: 'node', outfile: 'tests/out/balance.mjs', logLevel: 'error' });
const mod = await import('../tests/out/balance.mjs?' + Date.now());
console.log(mod.lowEnergy().join('\n'));
