import type { Palette } from './pixel';

/** Shared world palette for tiles. Characters are mnemonic-ish. */
export const TILE_PALETTE: Palette = {
  // grass & nature
  g: '#5fa64a', G: '#4f8f3e', h: '#72bb5c', F: '#e8d34a', f: '#e2557a', W: '#f4f4f0',
  T: '#2f7a35', t: '#3d9445', U: '#235f2a', k: '#6b4a2a', K: '#4e3419',
  // paths, roads, concrete
  d: '#c9a86a', D: '#b08c50', c: '#b8b8b0', C: '#a0a098', l: '#d2d2ca',
  a: '#4a4a52', A: '#3c3c44', y: '#d8d8c8', Y: '#8c8c84',
  // building materials
  s: '#d6c39a', S: '#b9a57c', z: '#e6d6b0', // tan siding
  r: '#8f8677', R: '#6e665a', q: '#a89e8c', Q: '#c2b8a5', // stone
  w: '#f2f2ee', v: '#cfcfca', // white trim
  e: '#2e5a3a', E: '#3b6e48', // green roof
  n: '#1c2a3a', N: '#2f4a63', // glass
  b: '#9b3f34', B: '#7d3128', m: '#c6b8a8', // brick + mortar
  o: '#4b4b55', O: '#5d5d68', // gray roof
  u: '#8d6237', V: '#6f4a28', // wood
  x: '#101014', X: '#22222a', // black / near black
  i: '#f0e6c8', I: '#d9caa0', // cream siding
  j: '#6f8fb8', J: '#4f6f98', // blue siding
  p: '#e0c9a0', P: '#c9ab78', // coffee shop wall
  // interior
  '1': '#7a7a80', '2': '#8a8a90', '3': '#9e9ea4', '4': '#e8e8e4', '5': '#17171c', '6': '#5a5a62',
  '7': '#b98c5a', '8': '#a67a4c', '9': '#d9d5cc', '0': '#c8c3b8',
  '@': '#ffb347', // amber LED strip
  '$': '#2ec27e', '%': '#f5d547', '&': '#ff5f5f', '*': '#ffffff', '+': '#2244aa', '#': '#66aaff',
  '~': '#6f5a3a', '^': '#3a2a1a', // stain / dark wood
  ':': '#c73b3b', ';': '#7f2222', // red accents (chairs, signs)
  '"': '#ffd27f', "'": '#ffe9b0', // warm light
  '`': '#a37bd1', '|': '#5d3d9a', // stained glass purple
  '<': '#4fb0d8', '>': '#2a7fa8', // stained glass blue
  '{': '#e8a24a', '}': '#c77d2b', // orange/wood accents
  '(': '#8bd07e', ')': '#5e9e55', // green accents
  '[': '#dcdce0', ']': '#a8a8b0', // light gray metal
};
