// Runs the whole test suite: art checks, balance simulation, browser playthrough, mobile checks.
import { spawnSync } from 'child_process';
const steps = [
  ['art', ['tests/check-art.mjs']],
  ['balance', ['tests/balance.mjs']],
  ['playthrough', ['tests/playthrough.mjs']],
  ['mobile', ['tests/mobile.mjs']],
];
let failed = false;
for (const [name, args] of steps) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync('node', args, { stdio: 'inherit', env: { ...process.env, NO_PROXY: 'localhost,127.0.0.1' } });
  if (r.status !== 0) { failed = true; console.log(`*** ${name} FAILED`); }
}
process.exit(failed ? 1 : 0);
