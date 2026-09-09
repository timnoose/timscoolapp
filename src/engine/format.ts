/** Formatting helpers (no Phaser dependency so data files can be unit-tested in Node). */
export function money(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}
