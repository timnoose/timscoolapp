/**
 * Tile art. Each tile is 16x16, drawn with the shared TILE_PALETTE.
 * `solid` blocks movement. `above` tiles render over the player (awnings, tree tops).
 * Names are referenced by maps (src/data/maps.ts).
 */
import { textured, type Rows } from './pixel';

export interface TileDef {
  rows: Rows;
  solid?: boolean;
  above?: boolean;
}

const T: Record<string, TileDef> = {};
const def = (name: string, rows: Rows, opts: Omit<TileDef, 'rows'> = {}) => {
  T[name] = { rows, ...opts };
};

// ---------- Ground textures ----------
def('grass', textured(16, 16, 'g', ['G', 'h'], 14, 11));
def('grass2', textured(16, 16, 'g', ['G', 'h', 'G'], 22, 23));
def('flowers', [
  'gggggggggggggggg',
  'gggFgggggggfgggg',
  'ggFWFgggggfWfggg',
  'gggFgggggggfgggg',
  'ggggggggggggGggg',
  'gggggggggGgggggg',
  'ggggggfggggggggg',
  'gggggfWfgggFgggg',
  'ggggggfggggFWFgg',
  'ggGgggggggggFggg',
  'gggggggggggggggg',
  'gggFggggggggggGg',
  'ggFWFgggggfggggg',
  'gggFggggggfWfggg',
  'ggggggGgggggfggg',
  'gggggggggggggggg',
]);
def('dirt', textured(16, 16, 'd', ['D'], 10, 5));
def('sidewalk', [
  'llllllllllllllll',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'cccccccCcccccccc',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'CCCCCCCCCCCCCCCC',
  'llllllllllllllll',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'ccCccccccccccccc',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'cccccccccccccccc',
  'CCCCCCCCCCCCCCCC',
]);
def('road', textured(16, 16, 'a', ['A'], 12, 7));
def('roadLineH', [
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'yyyyyyyyyyaaaaaa',
  'yyyyyyyyyyaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
]);
def('roadLineV', [
  'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa',
  'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa',
  'aaaaaaayyaaaaaaa', 'aaaaaaayyaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
]);
def('curbH', [
  'gggggggggggggggg', 'gggggggggggggggg', 'llllllllllllllll', 'cccccccccccccccc',
  'CCCCCCCCCCCCCCCC', 'AAAAAAAAAAAAAAAA', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaa',
]);
def('parking', textured(16, 16, 'a', ['A', 'a', 'Y'], 9, 31));
def('parkingLineV', [
  'aaaaaaaYYaaaaaaa', 'aaaaaaaYYaaaaaaa', 'aaaaaaaYaaaaaaaa', 'aaaaaaaYYaaaaaaa',
  'aaaaaaaYYaaaaaaa', 'aaaaaaaaYaaaaaaa', 'aaaaaaaYYaaaaaaa', 'aaaaaaaYYaaaaaaa',
  'aaaaaaaYYaaaaaaa', 'aaaaaaaYaaaaaaaa', 'aaaaaaaYYaaaaaaa', 'aaaaaaaYYaaaaaaa',
  'aaaaaaaYYaaaaaaa', 'aaaaaaaaYaaaaaaa', 'aaaaaaaYYaaaaaaa', 'aaaaaaaYYaaaaaaa',
]);
def('parkingCrack', [
  'aaaaaaaaaaaaaaaa', 'aaaaAaaaaaaaaaaa', 'aaaaaAaaaaaaaaaa', 'aaaaaaAAaaaaaaaa',
  'aaaaaaaaAaaaaaaa', 'aaaaaaaaAaaaaaaa', 'aaaaaaaaaAAaaaaa', 'aaaaaaaaaaaAaaaa',
  'aaaaaaaaaaaAaaaa', 'aaaaaaaaaaAAaaaa', 'aagGaaaaaAaaaaaa', 'aaaaaaaaaAaaaaaa',
  'aaaaaaaaaaAaaaaa', 'aaaaaaaaaaaAaaaa', 'aaaaaaaaaaaaAaaa', 'aaaaaaaaaaaaaAaa',
]);

// ---------- Nature ----------
def('tree', [
  '.....UUUUUU.....',
  '...UUTTTTTTUU...',
  '..UTTTtTTTTTTU..',
  '.UTTtthtTTTTTTU.',
  '.UTTthhtTTtTTTU.',
  'UTTTtttTTTtttTTU',
  'UTTTTTTTTTTTTTTU',
  'UTTTTTTtTTTTTTTU',
  'UUTTTTTTTTTTTTUU',
  '.UUTTTTTTTTTTUU.',
  '..UUUTTTTTTUUU..',
  '....UUKkkKUU....',
  '......KkkK......',
  '......KkkK......',
  '.....GKkkKG.....',
  '....GGGGGGGG....',
], { solid: true });
def('pineTop', [
  '.......UU.......',
  '......UTTU......',
  '.....UTTTTU.....',
  '.....UTtTTU.....',
  '....UTTTTTTU....',
  '....UTtTTTTU....',
  '...UTTTTTTTTU...',
  '...UTTtTTTTTU...',
  '..UTTTTTTtTTTU..',
  '..UTTtTTTTTTTU..',
  '.UTTTTTTTTTtTTU.',
  '.UTTTtTTTTTTTTU.',
  'UTTTTTTTTtTTTTTU',
  'UTTtTTTTTTTTTtTU',
  'UUUUUUUUUUUUUUUU',
  '.UTTTTTTTTTTTTU.',
], { solid: true });
def('pineBottom', [
  '.UTTTtTTTTTTTTU.',
  'UTTTTTTTTtTTTTTU',
  'UTTtTTTTTTTTtTTU',
  'UUUUUUUUUUUUUUUU',
  '.UTTTTTTTTTTTTU.',
  'UTTTtTTTTTtTTTTU',
  'UTTTTTTTTTTTTTTU',
  'UUUUUUUUUUUUUUUU',
  '......KkkK......',
  '......KkkK......',
  '......KkkK......',
  '.....GKkkKG.....',
  'ggggGGGGGGGGgggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('bush', [
  'gggggggggggggggg',
  'ggggUUUUUUUUgggg',
  'ggUUTTtTTTtTUUgg',
  'gUTTTtTTTTTTTTUg',
  'gUTtTTTTtTTTTtUg',
  'UTTTTTtTTTTTTTTU',
  'UTTtTTTTTTtTTTTU',
  'UTTTTTTTtTTTTtTU',
  'UTTTTtTTTTTTTTTU',
  'UUTTTTTTTTTTTTUU',
  'gUUTTtTTTTTTUUUg',
  'ggUUUUUUUUUUUUgg',
  'ggggGGGGGGGGgggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('fenceH', [
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'wwwwwwwwwwwwwwww',
  'vvvvvvvvvvvvvvvv',
  'gwvggwvggwvggwvg',
  'gwvggwvggwvggwvg',
  'wwwwwwwwwwwwwwww',
  'vvvvvvvvvvvvvvvv',
  'gwvggwvggwvggwvg',
  'gwvggwvggwvggwvg',
  'gwvggwvggwvggwvg',
  'gGGggGGggGGggGGg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('fenceV', [
  'gggggggwvgggggg.'.replace('.', 'g'),
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggwwvvgggggg',
  'ggggggGGGGgggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('signPost', [
  'gggggggggggggggg',
  'gVVVVVVVVVVVVVVg',
  'Vuuuuuuuuuuuuuuv'.replace('v', 'V'),
  'VuiiiiiiiiiiiiuV',
  'VuiVViViVVViiiuV',
  'VuiiiiiiiiiiiiuV',
  'VuiViVViiVViiiuV',
  'VuiiiiiiiiiiiiuV',
  'VuuuuuuuuuuuuuuV',
  'gVVVVVVVVVVVVVVg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'ggggggGkkGgggggg',
  'gggggggggggggggg',
], { solid: true });
def('lamp', [
  'aaaaaaaaaaaaaaaa',
  'aaaaaa"""""aaaaa',
  'aaaaaXXXXXXXaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaaXXaaaaaaa',
  'aaaaaaXXXXaaaaaa',
  'aaaaaXXXXXXaaaaa',
  'aaaaaaaaaaaaaaaa',
], { solid: true });
def('mailbox', [
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggXXXXXXXgggg',
  'ggggXOOOOOOOXggg',
  'ggggXO:OOOOOXggg',
  'ggggXO:OOOOOXggg',
  'ggggXOOOOOOOXggg',
  'ggggXXXXXXXXXggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'gggggggkkggggggg',
  'ggggggGkkGgggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('bench', [
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gVuuuuuuuuuuuuVg',
  'gVuuuuuuuuuuuuVg',
  'gVVVVVVVVVVVVVVg',
  'gVuuuuuuuuuuuuVg',
  'gVuuuuuuuuuuuuVg',
  'gVVVVVVVVVVVVVVg',
  'gVuuuuuuuuuuuuVg',
  'gVVVVVVVVVVVVVVg',
  'gVVggggggggggVVg',
  'gVVggggggggggVVg',
  'gggggggggggggggg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('memorialBench', [
  'gggggggggggggggg',
  'ggggggggggggggggg'.slice(0, 16),
  'gRRRRRRRRRRRRRRg',
  'gRqqqqqqqqqqqqRg',
  'gRqQQqQQQQqQQqRg',
  'gRqqqqqqqqqqqqRg',
  'gRRRRRRRRRRRRRRg',
  'gRqqqqqqqqqqqqRg',
  'gRqqqqqqqqqqqqRg',
  'gRRRRRRRRRRRRRRg',
  'gRRggggggggggRRg',
  'gRRggggggggggRRg',
  'gggggggggggggggg',
  'gggggFggggggFggg',
  'ggggFWFggggFWFgg',
  'gggggFggggggFggg',
], { solid: true });
def('dumpster', [
  'aaaaaaaaaaaaaaaa',
  'aeEEEEEEEEEEEEea',
  'aEEEEEEEEEEEEEEa',
  'aEEEeeeeeeeeEEEa',
  'aEEEEEEEEEEEEEEa',
  'aeeeeeeeeeeeeeea',
  'aeEEEEEEEEEEEEea',
  'aeEEEEEEEEEEEEea',
  'aeEEEEEEEEEEEEea',
  'aeEEEEEEEEEEEEea',
  'aeeeeeeeeeeeeeea',
  'aaXXaaaaaaaaXXaa',
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
], { solid: true });
def('acUnit', [
  'gggggggggggggggg',
  'g[[[[[[[[[[[[[[g',
  'g[]]]]]]]]]]]][g',
  'g[]]]]]]]]]]]][g',
  'g[]]]XXXXXX]]][g',
  'g[]]XX]]]]XX]][g',
  'g[]]X]]XX]]X]][g',
  'g[]]X]XXXX]X]][g',
  'g[]]X]]XX]]X]][g',
  'g[]]XX]]]]XX]][g',
  'g[]]]XXXXXX]]][g',
  'g[]]]]]]]]]]]][g',
  'g[[[[[[[[[[[[[[g',
  'gXXXXXXXXXXXXXXg',
  'gggggggggggggggg',
  'gggggggggggggggg',
], { solid: true });
def('trailerL', [
  'aaaaaaaaaaaaaaaa',
  'aaaawwwwwwwwwwww',
  'aaawvvvvvvvvvvvv',
  'aawwwwwwwwwwwwww',
  'awwwwwwwwwwwwwww',
  'awwww::::::wwwww',
  'awwww:ww:w:wwwww',
  'awwww::::::wwwww',
  'awwww:w:::w:wwww',
  'awwwwwwwwwwwwwww',
  'awwwww++wwwwwwww',
  'awwwwwwwwwwwwwww',
  'aXXXXXXXXXXXXXXX',
  'aaaaaaXXXaaaaaaa',
  'aaaaaXXXXXaaaaaa',
  'aaaaaaaaaaaaaaaa',
], { solid: true });
def('trailerR', [
  'aaaaaaaaaaaaaaaa',
  'wwwwwwwwwwwwwwaa',
  'vvvvvvvvvvvvvwaa',
  'wwwwwwwwwwwwwwaa',
  'wwwwwwwwwwwwwwwa',
  'ww::::::::wwwwwa',
  'ww::ww::w:wwwwwa',
  'ww::::::::wwwwwa',
  'ww:w::w:::wwwwwa',
  'wwwwwwwwwwwwwwwa',
  'wwwwww++wwwwwwwa',
  'wwwwwwwwwwwwwwwa',
  'XXXXXXXXXXXXXXXa',
  'aaaaaaXXXaaaaaaa',
  'aaaaaXXXXXaaaaaa',
  'aaaaaaaaaaaaaaaa',
], { solid: true });

// ---------- Warehouse church exterior ----------
def('whRoof', textured(16, 16, 'O', ['o'], 10, 3), { solid: true });
def('whRoofEdge', [
  'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO',
  'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO', 'OOOOOOOOOOOOOOOO',
  'oooooooooooooooo', 'oooooooooooooooo', 'XXXXXXXXXXXXXXXX', 'zzzzzzzzzzzzzzzz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
], { solid: true });
def('whSiding', [
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
], { solid: true });
def('whSidingBase', [
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'SSSSSSSSSSSSSSSS',
  'CCCCCCCCCCCCCCCC', 'cccccccccccccccc', 'CCCCCCCCCCCCCCCC', 'gggggggggggggggg',
], { solid: true });
def('whSidingWindow', [
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szwwwwwwwwwwwwsz',
  'szwnnnnnNNnnnnwz', 'szwnnnnnnnnnnnwz', 'szwnNnnnnnnnnnwz', 'szwwwwwwwwwwwwsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
  'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz', 'szszszszszszszsz',
], { solid: true });
def('gableL', [
  '................', '................', '................', '................',
  '..............ww', '............wwee', '..........wweeEe', '........wweeEeee',
  '......wweeeeeEee', '....wweeEeeeeeee', '..wweeeeeeeEeeee', 'wweeEeeeeeeeeeEe',
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', 'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq',
], { solid: true });
def('gableM', [
  '.......ww.......', '......weew......', '.....weeeew.....', '....weeEeeew....',
  '...weeeeeeeew...', '..weeeeeeEeeew..', '.weeEeeeeeeeeew.', 'weeeeeeeeeeeeeew',
  'eeeeeeeeeeeeeEee', 'eeeEeeeeeeeeeeee', 'eeeeeeeeeeEeeeee', 'eeeeeeeeEeeeeeee',
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', 'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq',
], { solid: true });
def('gableR', [
  '................', '................', '................', '................',
  'ww..............', 'eeww............', 'eEeeww..........', 'eeeEeeww........',
  'eeEeeeeeww......', 'eeeeeeeEeeww....', 'eeeeeEeeeeeeww..', 'eEeeeeeeeeEeeeww',
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', 'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq',
], { solid: true });
def('gableLogo', [
  '.......ww.......', '......weew......', '.....weeeew.....', '....weeeeeew....',
  '...weee%%eeew...', '..weee%%%%eeew..', '.weeee%(%%eeeew.', 'weeeee%%(%eeeeew',
  'eeeeeee%%eeeeeee', 'eeeeeeeeeeeeeeee', 'eeeeeeeeeeeeeeee', 'eeeeeeeeeeeeeeee',
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', 'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq',
], { solid: true });
def('stone', [
  'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq', 'rqqrrqqrrqqrrqqr', 'RqrqQqrqRqrqQqrq',
  'qrqrqrqrqrqrqrqr', 'rQqrRqqrrQqrRqqr', 'qrqrqrqrqrqrqrqr', 'rqRqqrQqrqRqqrQq',
  'qrqrqrqrqrqrqrqr', 'rqqrrqqrrqqrrqqr', 'QqrqRqrqQqrqRqrq', 'rqrqrqrqrqrqrqrq',
  'qrRqqrRqqrRqqrRq', 'rqqrrqqrrqqrrqqr', 'RqrqQqrqRqrqQqrq', 'qrqrqrqrqrqrqrqr',
], { solid: true });
def('stoneBase', [
  'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq', 'rqqrrqqrrqqrrqqr', 'RqrqQqrqRqrqQqrq',
  'qrqrqrqrqrqrqrqr', 'rQqrRqqrrQqrRqqr', 'qrqrqrqrqrqrqrqr', 'rqRqqrQqrqRqqrQq',
  'qrqrqrqrqrqrqrqr', 'rqqrrqqrrqqrrqqr', 'QqrqRqrqQqrqRqrq', 'RRRRRRRRRRRRRRRR',
  'CCCCCCCCCCCCCCCC', 'cccccccccccccccc', 'CCCCCCCCCCCCCCCC', 'cccccccccccccccc',
], { solid: true });
def('column', [
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', 'ccccwwwwwwwwcccc', 'ccccwvwwwwvwcccc',
  'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc',
  'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc', 'ccccwvwwwwvwcccc',
  'ccccwvwwwwvwcccc', 'cccwwwwwwwwwwccc', 'ccvvvvvvvvvvvvcc', 'cccccccccccccccc',
], { solid: true });
def('churchSign', [
  'rqrqrqrqrqrqrqrq', 'qXXXXXXXXXXXXXXq', 'rX*XX*XX*XX*XX*X'.replace('X', 'X'), 'qX************Xq',
  'rX*X*X*XX*X*X*Xr', 'qX************Xq', 'rX*X*X*X*X*X*XXr', 'qXXXXXXXXXXXXXXq',
  'rqrqrqrqrqrqrqrq', 'qrRqqrRqqrRqqrRq', 'rqqrrqqrrqqrrqqr', 'RqrqQqrqRqrqQqrq',
  'qrqrqrqrqrqrqrqr', 'rQqrRqqrrQqrRqqr', 'qrqrqrqrqrqrqrqr', 'rqRqqrQqrqRqqrQq',
], { solid: true });
def('glassDoorL', [
  'wwwwwwwwwwwwwwww', 'wnnnnnnnnnnnnnnw', 'wnNNnnnnnnnnnnnw', 'wnNnnnnnnnnnnnnw',
  'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnn[nw',
  'wnnnnnnnnnnnn[nw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw',
  'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wwwwwwwwwwwwwwww', 'cccccccccccccccc',
]);
def('glassDoorR', [
  'wwwwwwwwwwwwwwww', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnNNnw', 'wnnnnnnnnnnnnNnw',
  'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wn[nnnnnnnnnnnnw',
  'wn[nnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw',
  'wnnnnnnnnnnnnnnw', 'wnnnnnnnnnnnnnnw', 'wwwwwwwwwwwwwwww', 'cccccccccccccccc',
]);

// ---------- Generic house / shop parts ----------
const wallTex = (a: string, b: string, seed: number) => textured(16, 16, a, [b], 8, seed);
def('houseCream', wallTex('i', 'I', 41), { solid: true });
def('houseBlue', wallTex('j', 'J', 42), { solid: true });
def('houseWhite', wallTex('w', 'v', 43), { solid: true });
def('brick', [
  'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbBbbbbmbbbBbbbm', 'mmmmmmmmmmmmmmmm',
  'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'bBbmbbbBbbbmbbbb', 'mmmmmmmmmmmmmmmm',
  'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbbBbbbmbbBbbbbm', 'mmmmmmmmmmmmmmmm',
  'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'bBbmbbbbbbbmbBbb', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('brickTan', [
  'sssssssSsssssssS', 'sssssssSsssssssS', 'ssSssssSsssSsssS', 'QQQQQQQQQQQQQQQQ',
  'sssSsssssssSssss', 'sssSsssssssSssss', 'sSsSsssSsssSssss', 'QQQQQQQQQQQQQQQQ',
  'sssssssSsssssssS', 'sssssssSsssssssS', 'sssSsssSssSssssS', 'QQQQQQQQQQQQQQQQ',
  'sssSsssssssSssss', 'sssSsssssssSssss', 'sSsSsssssssSsSss', 'QQQQQQQQQQQQQQQQ',
], { solid: true });
def('window', [
  'iiiiiiiiiiiiiiii', 'iiwwwwwwwwwwwwii', 'iiw#####w#####wi'.slice(0, 16), 'iiw##*##w#####wi',
  'iiw#####w#####wi', 'iiw#####w#####wi', 'iiwwwwwwwwwwwwii', 'iiw#####w#####wi',
  'iiw#####w#####wi', 'iiw#####w#####wi', 'iiw#####w#####wi', 'iiwwwwwwwwwwwwii',
  'iivvvvvvvvvvvvii', 'iiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiii',
], { solid: true });
def('windowBlue', [
  'jjjjjjjjjjjjjjjj', 'jjwwwwwwwwwwwwjj', 'jjw#####w#####wj', 'jjw##*##w#####wj',
  'jjw#####w#####wj', 'jjw#####w#####wj', 'jjwwwwwwwwwwwwjj', 'jjw#####w#####wj',
  'jjw#####w#####wj', 'jjw#####w#####wj', 'jjw#####w#####wj', 'jjwwwwwwwwwwwwjj',
  'jjvvvvvvvvvvvvjj', 'jjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjj',
], { solid: true });
def('windowBrick', [
  'bbbbbbbmbbbbbbbm', 'bbwwwwwwwwwwwwbm', 'bbw#####w#####wm', 'mmw##*##w#####wm',
  'bbw#####w#####wb', 'bbw#####w#####wb', 'bbwwwwwwwwwwwwwb', 'mmw#####w#####wm',
  'bbw#####w#####wm', 'bbw#####w#####wm', 'bbw#####w#####wm', 'mmwwwwwwwwwwwwwm',
  'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'bBbmbbbbbbbmbBbb', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('doorWood', [
  'iiiiiiiiiiiiiiii', 'iiVVVVVVVVVVVVii', 'iiVuuuuuuuuuuVii', 'iiVuVVVuuVVVuVii',
  'iiVuVuVuuVuVuVii', 'iiVuVVVuuVVVuVii', 'iiVuuuuuuuuuuVii', 'iiVuuuuuuuuuuVii',
  'iiVuuuuuuuu%uVii', 'iiVuuuuuuuuuuVii', 'iiVuVVVuuVVVuVii', 'iiVuVuVuuVuVuVii',
  'iiVuVVVuuVVVuVii', 'iiVuuuuuuuuuuVii', 'iiVVVVVVVVVVVVii', 'cccccccccccccccc',
]);
def('doorWoodBlue', [
  'jjjjjjjjjjjjjjjj', 'jjVVVVVVVVVVVVjj', 'jjVuuuuuuuuuuVjj', 'jjVuVVVuuVVVuVjj',
  'jjVuVuVuuVuVuVjj', 'jjVuVVVuuVVVuVjj', 'jjVuuuuuuuuuuVjj', 'jjVuuuuuuuuuuVjj',
  'jjVuuuuuuuu%uVjj', 'jjVuuuuuuuuuuVjj', 'jjVuVVVuuVVVuVjj', 'jjVuVuVuuVuVuVjj',
  'jjVuVVVuuVVVuVjj', 'jjVuuuuuuuuuuVjj', 'jjVVVVVVVVVVVVjj', 'cccccccccccccccc',
]);
def('doorShop', [
  'bbbbbbbmbbbbbbbm', 'bbVVVVVVVVVVVVbm', 'bbVnnnnnnnnnnVbm', 'mmVnNNnnnnnnnVbm',
  'bbVnNnnnnnnnnVbb', 'bbVnnnnnnnnnnVbb', 'bbVnnnnnnnnnnVbb', 'mmVnnnnnnnn%nVbm',
  'bbVnnnnnnnnnnVbm', 'bbVnnnnnnnnnnVbm', 'bbVuuuuuuuuuuVbm', 'mmVuuuuuuuuuuVbm',
  'bbVuuuuuuuuuuVbb', 'bbVuuuuuuuuuuVbb', 'bbVVVVVVVVVVVVbb', 'cccccccccccccccc',
]);
def('roofGray', [
  'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo', 'oooooooooooooooo', 'OOOoOOOOOOOoOOOO',
  'OOOoOOOOOOOoOOOO', 'oooooooooooooooo', 'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo',
  'oooooooooooooooo', 'OOOoOOOOOOOoOOOO', 'OOOoOOOOOOOoOOOO', 'oooooooooooooooo',
  'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo', 'oooooooooooooooo', 'OOOoOOOOOOOoOOOO',
], { solid: true });
def('roofBrown', [
  'uuuuuuuVuuuuuuuV', 'uuuuuuuVuuuuuuuV', 'VVVVVVVVVVVVVVVV', 'uuuVuuuuuuuVuuuu',
  'uuuVuuuuuuuVuuuu', 'VVVVVVVVVVVVVVVV', 'uuuuuuuVuuuuuuuV', 'uuuuuuuVuuuuuuuV',
  'VVVVVVVVVVVVVVVV', 'uuuVuuuuuuuVuuuu', 'uuuVuuuuuuuVuuuu', 'VVVVVVVVVVVVVVVV',
  'uuuuuuuVuuuuuuuV', 'uuuuuuuVuuuuuuuV', 'VVVVVVVVVVVVVVVV', 'uuuVuuuuuuuVuuuu',
], { solid: true });
def('roofRed', [
  ':::::::;:::::::;', ':::::::;:::::::;', ';;;;;;;;;;;;;;;;', ':::;:::::::;::::',
  ':::;:::::::;::::', ';;;;;;;;;;;;;;;;', ':::::::;:::::::;', ':::::::;:::::::;',
  ';;;;;;;;;;;;;;;;', ':::;:::::::;::::', ':::;:::::::;::::', ';;;;;;;;;;;;;;;;',
  ':::::::;:::::::;', ':::::::;:::::::;', ';;;;;;;;;;;;;;;;', ':::;:::::::;::::',
], { solid: true });
def('roofEdgeGray', [
  'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo', 'oooooooooooooooo', 'OOOoOOOOOOOoOOOO',
  'OOOoOOOOOOOoOOOO', 'oooooooooooooooo', 'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo',
  'oooooooooooooooo', 'OOOoOOOOOOOoOOOO', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv',
  'iiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiii', 'iiiiiiiiiiiiiiii',
], { solid: true });
def('roofEdgeBrown', [
  'uuuuuuuVuuuuuuuV', 'uuuuuuuVuuuuuuuV', 'VVVVVVVVVVVVVVVV', 'uuuVuuuuuuuVuuuu',
  'uuuVuuuuuuuVuuuu', 'VVVVVVVVVVVVVVVV', 'uuuuuuuVuuuuuuuV', 'uuuuuuuVuuuuuuuV',
  'VVVVVVVVVVVVVVVV', 'uuuVuuuuuuuVuuuu', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv',
  'jjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjj', 'jjjjjjjjjjjjjjjj',
], { solid: true });
def('roofEdgeRed', [
  ':::::::;:::::::;', ':::::::;:::::::;', ';;;;;;;;;;;;;;;;', ':::;:::::::;::::',
  ':::;:::::::;::::', ';;;;;;;;;;;;;;;;', ':::::::;:::::::;', ':::::::;:::::::;',
  ';;;;;;;;;;;;;;;;', ':::;:::::::;::::', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv',
  'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbBbbbbmbbbBbbbm', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('awning', [
  'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', ':::www:::www:::w', ':::www:::www:::w',
  ':::www:::www:::w', ':::www:::www:::w', ':::www:::www:::w', ';;;vvv;;;vvv;;;v',
  'XXXXXXXXXXXXXXXX', 'bbbbbbbmbbbbbbbm', 'bbw*****w*****wm', 'bbw#####w#####wm',
  'bbw#####w#####wm', 'bbw#####w#####wm', 'bbwwwwwwwwwwwwwm', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('shopSign', [
  'bbbbbbbmbbbbbbbm', 'bXXXXXXXXXXXXXXm', 'bX""""""""""""Xm', 'bX"XX"X"X"XXX"Xm',
  'bX"X"""X"X"X""Xm', 'bX"XX"X"X"XXX"Xm', 'bX""""""""""""Xm', 'bXXXXXXXXXXXXXXm',
  'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbBbbbbmbbbBbbbm', 'mmmmmmmmmmmmmmmm',
  'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'bBbmbbbBbbbmbbbb', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('cityWall', [
  '0000000090000000', '0000000090000000', '9999999999999999', '0009000000090000',
  '0009000000090000', '9999999999999999', '0000000090000000', '0000000090000000',
  '9999999999999999', '0009000000090000', '0009000000090000', '9999999999999999',
  '0000000090000000', '0000000090000000', '9999999999999999', '0009000000090000',
], { solid: true });
def('cityWindow', [
  '0000000090000000', '00wwwwwwwwwwww00', '99w##########w99', '00w##*#######w00',
  '00w##########w00', '99wwwwwwwwwwww99', '00w##########w00', '00w##########w00',
  '99w##########w99', '00w##########w00', '00wwwwwwwwwwww00', '9999999999999999',
  '0000000090000000', '0000000090000000', '9999999999999999', '0009000000090000',
], { solid: true });
def('cityColumn', [
  'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', '0000wwwwwwww0000', '0000wvwwwwvw0000',
  '0000wvwwwwvw0000', '0000wvwwwwvw0000', '0000wvwwwwvw0000', '0000wvwwwwvw0000',
  '0000wvwwwwvw0000', '0000wvwwwwvw0000', '0000wvwwwwvw0000', '0000wvwwwwvw0000',
  '0000wvwwwwvw0000', '000wwwwwwwwww000', '00vvvvvvvvvvvv00', '0000000000000000',
], { solid: true });
def('cityDoor', [
  '0000000090000000', '00VVVVVVVVVVVV00', '00VuuuuuuuuuuV00', '00VuuVVVVVVuuV00',
  '00VuuVnnnnVuuV00', '00VuuVnnnnVuuV00', '00VuuVVVVVVuuV00', '00VuuuuuuuuuuV00',
  '00Vuuuu%uuuuuV00', '00VuuuuuuuuuuV00', '00VuuuuuuuuuuV00', '00VuuuuuuuuuuV00',
  '00VuuuuuuuuuuV00', '00VuuuuuuuuuuV00', '00VVVVVVVVVVVV00', 'cccccccccccccccc',
]);
def('citySign', [
  '0000000090000000', '0XXXXXXXXXXXXXX0', '0X************X0', '0X*XX*X*XX*X*XX0',
  '0X*X**X*X**XX*X0', '0X*XX*X*XX*X*XX0', '0X************X0', '0XXXXXXXXXXXXXX0',
  '9999999999999999', '0009000000090000', '0009000000090000', '9999999999999999',
  '0000000090000000', '0000000090000000', '9999999999999999', '0009000000090000',
], { solid: true });
def('cityRoof', [
  '9999999999999999', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', '0000000000000000',
  '0000000000000000', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv', '0000000000000000',
  '0000000090000000', '0000000090000000', '9999999999999999', '0009000000090000',
  '0009000000090000', '9999999999999999', '0000000090000000', '0000000090000000',
], { solid: true });
def('flagPole', [
  'cccccccc[ccccccc', 'cccccccc[&&&&&cc', 'cccccccc[*****cc', 'cccccccc[&&&&&cc',
  'cccccccc[*****cc', 'cccccccc[&&&&&cc', 'cccccccc[ccccccc', 'cccccccc[ccccccc',
  'cccccccc[ccccccc', 'cccccccc[ccccccc', 'cccccccc[ccccccc', 'cccccccc[ccccccc',
  'cccccccc[ccccccc', 'cccccccc[ccccccc', 'ccccccc]]]cccccc', 'cccccccccccccccc',
], { solid: true });
def('aptWall', [
  'sSsSsSsSsSsSsSsS', 'SsSsSsSsSsSsSsSs', 'sSwwwwwwsSwwwwww', 'Ssw####wSsw####w',
  'sSw####wsSw####w', 'SswwwwwwSswwwwww', 'sSsSsSsSsSsSsSsS', 'SsSsSsSsSsSsSsSs',
  'sSsSsSsSsSsSsSsS', 'SsSsSsSsSsSsSsSs', 'sSwwwwwwsSwwwwww', 'Ssw####wSsw####w',
  'sSw####wsSw####w', 'SswwwwwwSswwwwww', 'sSsSsSsSsSsSsSsS', 'SsSsSsSsSsSsSsSs',
], { solid: true });
def('aptRoof', [
  'oooooooooooooooo', 'OOOOOOOOOOOOOOOO', 'oooooooooooooooo', 'sSsSsSsSsSsSsSsS',
  'SsSsSsSsSsSsSsSs', 'sSwwwwwwsSwwwwww', 'Ssw####wSsw####w', 'sSw####wsSw####w',
  'SswwwwwwSswwwwww', 'sSsSsSsSsSsSsSsS', 'SsSsSsSsSsSsSsSs', 'sSsSsSsSsSsSsSsS',
  'SsSsSsSsSsSsSsSs', 'sSwwwwwwsSwwwwww', 'Ssw####wSsw####w', 'sSw####wsSw####w',
], { solid: true });

// ---------- Historic chapel (buy ending) ----------
def('chapelBrick', [
  'BbbbbbbmBbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'mmmmmmmmmmmmmmmm',
  'bbbmBbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmBbbb', 'mmmmmmmmmmmmmmmm',
  'bbbbbbbmbbbbbbbm', 'BbbbbbbmbbbbbbBm', 'bbbbbbbmbbbbbbbm', 'mmmmmmmmmmmmmmmm',
  'bbbmbbbbbbbmbbbb', 'bbbmbbbbBbbmbbbb', 'bbbmbbbbbbbmbbbb', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('chapelWindow', [
  'bbbbbbbmbbbbbbbm', 'bbbbbwwwwwwbbbbm', 'bbbbw`<`<`<wbbbm', 'mmmw<`<`<`<`wmmm',
  'bbbw`<`%`<`<wbbb', 'bbbw<`%%%`<`wbbb', 'bbbw`<`%`<`<wbbb', 'mmmw<`<`<`<`wmmm',
  'bbbw`<`<`<`<wbbm', 'bbbw<`<`<`<`wbbm', 'bbbw`<`<`<`<wbbm', 'mmmw<`<`<`<`wmmm',
  'bbbwwwwwwwwwwbbb', 'bbbmbbbbbbbmbbbb', 'bbbmbbbbbbbmbbbb', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('chapelDoor', [
  'bbbbbbbmbbbbbbbm', 'bbbbbVVVVVVbbbbm', 'bbbbVVuuuuVVbbbm', 'mmmVVuuuuuuVVmmm',
  'bbbVuuVuuVuuVbbb', 'bbbVuuVuuVuuVbbb', 'bbbVuuVuuVuuVbbb', 'mmmVuuVuuVuuVmmm',
  'bbbVuuVuuVuuVbbm', 'bbbVu%VuuV%uVbbm', 'bbbVuuVuuVuuVbbm', 'mmmVuuVuuVuuVmmm',
  'bbbVuuVuuVuuVbbb', 'bbbVuuVuuVuuVbbb', 'bbbVVVVVVVVVVbbb', 'cccccccccccccccc',
]);
def('steepleTop', [
  '.......ww.......', '.......ww.......', '......wwww......', '.......ww.......',
  '.......ww.......', '......oOOo......', '......oOOo......', '.....oOOOOo.....',
  '.....oOOOOo.....', '....oOOOOOOo....', '....oOOOOOOo....', '...oOOOOOOOOo...',
  '...oOOOOOOOOo...', '..oOOOOOOOOOOo..', '..oOOOOOOOOOOo..', '.oOOOOOOOOOOOOo.',
], { solid: true });
def('steepleBase', [
  'wwwwwwwwwwwwwwww', 'wbbbbbbmbbbbbbbw', 'wbbbbbbmbbbbbbbw', 'wmmmmmmmmmmmmmmw',
  'wbbbwwwwwwwwbbbw', 'wbbbw`<`<`<wbbbw', 'wbbbw<`<`<`wbbbw', 'wmmmw`<`<`<wmmmw',
  'wbbbw<`<`<`wbbbw', 'wbbbwwwwwwwwbbbw', 'wbbbbbbmbbbbbbbw', 'wmmmmmmmmmmmmmmw',
  'wbbbmbbbbbbbmbbw', 'wbbbmbbbbbbbmbbw', 'wbbbmbbbbbbbmbbw', 'wmmmmmmmmmmmmmmw',
], { solid: true });
def('forSaleSign', [
  'gggggggggggggggg', 'g::::::::::::::g', ':wwwwwwwwwwwwww:', ':w:ww:w:ww:ww:w:',
  ':w:w:::w:w::w:w:', ':w:ww:w:ww:ww:w:', ':wwwwwwwwwwwwww:', ':w::w:w::w:w:ww:',
  ':wwwwwwwwwwwwww:', 'g::::::::::::::g', 'gggggggkkggggggg', 'gggggggkkggggggg',
  'gggggggkkggggggg', 'gggggggkkggggggg', 'ggggggGkkGgggggg', 'gggggggggggggggg',
], { solid: true });
def('lotSign', [
  'gggggggggggggggg', 'gVVVVVVVVVVVVVVg', 'VuuuuuuuuuuuuuuV', 'VuwwwwwwwwwwwwuV',
  'VuwXwXXwXwXwXwuV', 'VuwwwwwwwwwwwwuV', 'VuwXXwXwXXwXwwuV', 'VuwwwwwwwwwwwwuV',
  'VuuuuuuuuuuuuuuV', 'gVVVVVVVVVVVVVVg', 'gggggggkkggggggg', 'gggggggkkggggggg',
  'gggggggkkggggggg', 'gggggggkkggggggg', 'ggggggGkkGgggggg', 'gggggggggggggggg',
], { solid: true });

// ---------- Interiors: floors & walls ----------
def('carpet', textured(16, 16, '1', ['2'], 18, 77));
def('carpetDark', textured(16, 16, '6', ['1'], 10, 78));
def('woodFloor', [
  '7777777787777777', '7777777787777777', '8888888888888888', '7778777777787777',
  '7778777777787777', '8888888888888888', '7777777787777777', '7777777787777777',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
  '7777777787777777', '7777777787777777', '8888888888888888', '7778777777787777',
]);
def('marble', [
  '9999999909999999', '9999999909999999', '9999999909999999', '9999999909999999',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
  '9999999909999999', '9999999909999999', '9999999909999999', '9999999909999999',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
]);
def('rug', [
  ';;;;;;;;;;;;;;;;', ';::::::::::::::;', ';:;;;;;;;;;;;;:;', ';:;::::::::::;:;',
  ';:;::::::::::;:;', ';:;::::::::::;:;', ';:;::::::::::;:;', ';:;::::::::::;:;',
  ';:;::::::::::;:;', ';:;::::::::::;:;', ';:;::::::::::;:;', ';:;::::::::::;:;',
  ';:;::::::::::;:;', ';:;;;;;;;;;;;;:;', ';::::::::::::::;', ';;;;;;;;;;;;;;;;',
]);
def('warmFloor', [
  '{{{{{{{}{{{{{{{}', '{{{{{{{}{{{{{{{}', '}}}}}}}}}}}}}}}}', '{{{}{{{{{{{}{{{{',
  '{{{}{{{{{{{}{{{{', '}}}}}}}}}}}}}}}}', '{{{{{{{}{{{{{{{}', '{{{{{{{}{{{{{{{}',
  '}}}}}}}}}}}}}}}}', '{{{}{{{{{{{}{{{{', '{{{}{{{{{{{}{{{{', '}}}}}}}}}}}}}}}}',
  '{{{{{{{}{{{{{{{}', '{{{{{{{}{{{{{{{}', '}}}}}}}}}}}}}}}}', '{{{}{{{{{{{}{{{{',
]);
def('wallTop', [
  '5555555555555555', '3333333333333333', '@@@@@@@@@@@@@@@@', '3333333333333333',
  '3333333333333333', '3333333333333333', '3333333333333333', '3333333333333333',
  '3333333333333333', '3333333333333333', '3333333333333333', '3333333333333333',
  '3333333333333333', '3333333333333333', '3333333333333333', '3333333333333333',
], { solid: true });
def('wallWainscot', [
  '3333333333333333', '3333333333333333', '3333333333333333', 'vvvvvvvvvvvvvvvv',
  '4444444444444444', '4444444444444444', '4444444444444444', '4v44444444v44444',
  '4v44444444v44444', '4v44444444v44444', '4444444444444444', '4444444444444444',
  '4444444444444444', 'vvvvvvvvvvvvvvvv', '6666666666666666', '6666666666666666',
], { solid: true });
def('wallSide', [
  '5566666666666655', '5566666666666655', '5566666666666655', '5566666666666655',
  '5566666666666655', '5566666666666655', '5566666666666655', '5566666666666655',
  '5566666666666655', '5566666666666655', '5566666666666655', '5566666666666655',
  '5566666666666655', '5566666666666655', '5566666666666655', '5566666666666655',
], { solid: true });
def('wallDark', textured(16, 16, '5', ['X'], 6, 90), { solid: true });
def('drape', [
  '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5', '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5',
  '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5', '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5',
  '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5', '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5',
  '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5', '5X5X5X5X5X5X5X5X', 'X5X5X5X5X5X5X5X5',
], { solid: true });
def('wallCream', [
  '5555555555555555', 'PPPPPPPPPPPPPPPP', 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu', 'VVVVVVVVVVVVVVVV',
], { solid: true });
def('wallCity', [
  '5555555555555555', '0000000000000000', '9999999999999999', '9999999999999999',
  '9999999999999999', '9999999999999999', '9999999999999999', '9999999999999999',
  '9999999999999999', '9999999999999999', '9999999999999999', 'wwwwwwwwwwwwwwww',
  'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu', 'VVVVVVVVVVVVVVVV',
], { solid: true });
def('wallChapel', [
  '5555555555555555', 'ppppppppppppppppp'.slice(0, 16), 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp', 'pppppppppppppppp',
  'pppppppppppppppp', 'VVVVVVVVVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu',
], { solid: true });
def('stainedGlass', [
  '5555555555555555', 'pppppwwwwwwppppp', 'ppppw`<`|<`wpppp', 'pppw<`|<`|<`wppp',
  'pppw`<`%`<`|wppp', 'pppw|`%%%`<`wppp', 'pppw`<`%`|<`wppp', 'pppw<`|<`<`|wppp',
  'pppw`<`<|<`<wppp', 'pppw<`|<`|<`wppp', 'pppw`<`<`<|`wppp', 'pppw|<`|<`<`wppp',
  'pppwwwwwwwwwwppp', 'VVVVVVVVVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu',
], { solid: true });
def('ledWall', [
  '5555555555555555', 'XXXXXXXXXXXXXXXX', 'X+#+#+#+#+#+#+#X', 'X#+#+#+#+#+#+#+X',
  'X+#+$$$$$$$$+#+X', 'X#+#$*$$$$*$#+#X', 'X+#+$$**$**$+#+X', 'X#+#$$$****$#+#X',
  'X+#+$$$$**$$+#+X', 'X#+#$$$$$$$$#+#X', 'X+#+#+#+#+#+#+#X', 'X#+#+#+#+#+#+#+X',
  'XXXXXXXXXXXXXXXX', '6666666666666666', '6666666666666666', '6666666666666666',
], { solid: true });
def('doorMat', [
  '1111111111111111', '1XXXXXXXXXXXXXX1', '1X;;;;;;;;;;;;X1', '1X;::::::::::;X1',
  '1X;:;;:;;;:;;;X1', '1X;::::::::::;X1', '1X;:;;;:;:;;:;X1', '1X;::::::::::;X1',
  '1X;;;;;;;;;;;;X1', '1XXXXXXXXXXXXXX1', '1111111111111111', '1111111111111111',
  '1111111111111111', '1111111111111111', '1111111111111111', '1111111111111111',
]);
def('exitWood', [
  '7777777787777777', '7XXXXXXXXXXXXXX7', '7X;;;;;;;;;;;;X7', '7X;::::::::::;X7',
  '7X;:;;:;;;:;;;X7', '7X;::::::::::;X7', '7X;:;;;:;:;;:;X7', '7X;::::::::::;X7',
  '7X;;;;;;;;;;;;X7', '7XXXXXXXXXXXXXX7', '8888888888888888', '7778777777787777',
  '7778777777787777', '8888888888888888', '7777777787777777', '7777777787777777',
]);
def('exitMarble', [
  '9999999909999999', '9XXXXXXXXXXXXXX9', '9X;;;;;;;;;;;;X9', '9X;::::::::::;X9',
  '9X;:;;:;;;:;;;X9', '9X;::::::::::;X9', '9X;:;;;:;:;;:;X9', '9X;::::::::::;X9',
  '9X;;;;;;;;;;;;X9', '9XXXXXXXXXXXXXX9', '9999999909999999', '9999999909999999',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
]);
def('officeDoor', [
  '5555555555555555', '3333333333333333', '@@@@@@@@@@@@@@@@', '33VVVVVVVVVVVV33',
  '33VuuuuuuuuuuV33', '33VuVVVuuVVVuV33', '33VuVuVuuVuVuV33', '33VuVVVuuVVVuV33',
  '33VuuuuuuuuuuV33', '33Vuuuuuuuu%uV33', '33VuuuuuuuuuuV33', '33VuVVVuuVVVuV33',
  '33VuVuVuuVuVuV33', '33VuVVVuuVVVuV33', '33VuuuuuuuuuuV33', '33VVVVVVVVVVVV33',
]);

// ---------- Interiors: furniture ----------
def('chairRow', [
  '1111111111111111', '1XXXXXX11XXXXXX1', '1X6666X11X6666X1', '1X6666X11X6666X1',
  '1X6666X11X6666X1', '1X6666X11X6666X1', '1XXXXXX11XXXXXX1', '1X6666X11X6666X1',
  '1X6666X11X6666X1', '1X6666X11X6666X1', '1XXXXXX11XXXXXX1', '1X1111X11X1111X1',
  '1X1111X11X1111X1', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('chairSingle', [
  '1111111111111111', '1111XXXXXXXX1111', '1111X666666X1111', '1111X666666X1111',
  '1111X666666X1111', '1111XXXXXXXX1111', '1111X666666X1111', '1111X666666X1111',
  '1111X666666X1111', '1111XXXXXXXX1111', '1111X111111X1111', '1111X111111X1111',
  '1111111111111111', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('stage', [
  'XXXXXXXXXXXXXXXX', '5555555555555555', '5555555555555555', '5555555555555555',
  '5555555555555555', '5555555555555555', '5555555555555555', '5555555555555555',
  '5555555555555555', '5555555555555555', '5555555555555555', '5555555555555555',
  '5555555555555555', '5555555555555555', 'XXXXXXXXXXXXXXXX', '6666666666666666',
], { solid: true });
def('pulpit', [
  '5555555555555555', '5555555555555555', '555XXXXXXXXXX555', '555X[[[[[[[[X555',
  '555X[[[[[[[[X555', '555X[]]]]]][X555', '555XXXXXXXXXX555', '5555555XX5555555',
  '5555555XX5555555', '5555555XX5555555', '5555555XX5555555', '5555555XX5555555',
  '55555XXXXXX55555', '5555555555555555', 'XXXXXXXXXXXXXXXX', '6666666666666666',
], { solid: true });
def('tvWall', [
  '5555555555555555', '3333333333333333', '@@@@@@@@@@@@@@@@', '3XXXXXXXXXXXXXX3',
  '3X++++++++++++X3', '3X+**+*+*+*+*+X3', '3X++++++++++++X3', '3X+*+**+*+**++X3',
  '3X++++++++++++X3', '3X+*+*+++*+*++X3', '3X++++++++++++X3', '3XXXXXXXXXXXXXX3',
  '3333333XX3333333', '333333XXXX333333', '3333333333333333', '3333333333333333',
], { solid: true });
def('counterL', [
  '1111111111111111', '1111111111111111', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu',
  'uwwwwwwwwwwwwwwu', 'uwXXwwXXXwXXXwwu', 'uwXXwXXwXwXwXwwu', 'uwwwwwwwwwwwwwwu',
  'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV',
  'VVVVVVVVVVVVVVVV', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('counterCoffee', [
  '1111111111111111', '111XXXX111111111', '111X~~X1111XXX11', '111X~~X111X***X1',
  'VVVXXXXVVVX***XV', 'uuuuuuuuuuXXXXuu', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu',
  'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV',
  'VVVVVVVVVVVVVVVV', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('counterR', [
  '1111111111111111', '1111111111111111', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu',
  'uuuu*u*uuuuuuuuu', 'uuuu***uuuu%%uuu', 'uuuuu*uuuuu%%uuu', 'uuuuuuuuuuuuuuuu',
  'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV',
  'VVVVVVVVVVVVVVVV', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('soundDesk', [
  '1111111111111111', '1XXXXXXXXXXXXXX1', '1X]]]]]]]]]]]]X1', '1X]$]&]$]%]$]]X1',
  '1X]]]]]]]]]]]]X1', '1X]*]*]*]*]*]]X1', '1X]*]*]*]*]*]]X1', '1X]]]]]]]]]]]]X1',
  '1XXXXXXXXXXXXXX1', '1VVVVVVVVVVVVVV1', '1VuuuuuuuuuuuuV1', '1VuuuuuuuuuuuuV1',
  '1VVVVVVVVVVVVVV1', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('laptopTable', [
  '1111111111111111', '1111111111111111', '1VVVVVVVVVVVVVV1', '1VuuuuuuuuuuuuV1',
  '1VuuXXXXXXXXuuV1', '1VuuX######XuuV1', '1VuuX##**##XuuV1', '1VuuXXXXXXXXuuV1',
  '1Vu]]]]]]]]]]uV1', '1VuuuuuuuuuuuuV1', '1VVVVVVVVVVVVVV1', '1V111111111111V1',
  '1V111111111111V1', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('desk', [
  '1111111111111111', 'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'Vuu*****uuuuuuuV',
  'Vuu*XX**uuXXXXuV', 'Vuu*****uuX##XuV', 'Vuu*****uuX##XuV', 'VuuuuuuuuuXXXXuV',
  'VuuuuuuuuuuuuuuV', 'VVVVVVVVVVVVVVVV', 'VV11111111111VV1'.slice(0, 16), 'VV111111111111VV',
  '1111111111111111', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('bookshelf', [
  '5555555555555555', 'VVVVVVVVVVVVVVVV', 'V:&$+:%$&+:$%&:V', 'V:&$+:%$&+:$%&:V',
  'V:&$+:%$&+:$%&:V', 'VVVVVVVVVVVVVVVV', 'V$+:&%$+:&%$+:&V', 'V$+:&%$+:&%$+:&V',
  'V$+:&%$+:&%$+:&V', 'VVVVVVVVVVVVVVVV', 'V+%$:&+%$:&+%$:V', 'V+%$:&+%$:&+%$:V',
  'V+%$:&+%$:&+%$:V', 'VVVVVVVVVVVVVVVV', '1111111111111111', '1111111111111111',
], { solid: true });
def('couch', [
  '1111111111111111', '1111111111111111', 'JJJJJJJJJJJJJJJJ', 'JjjjjjjjjjjjjjjJ',
  'JjjjjjjjjjjjjjjJ', 'JJJJJJJJJJJJJJJJ', 'JjjjjjjjJjjjjjjJ', 'JjjjjjjjJjjjjjjJ',
  'JjjjjjjjJjjjjjjJ', 'JjjjjjjjJjjjjjjJ', 'JJJJJJJJJJJJJJJJ', 'JJ111111111111JJ',
  'JJ111111111111JJ', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('fileCabinet', [
  '5555555555555555', '1[[[[[[[[[[[[[[1', '1[]]]]]]]]]]]][1', '1[]]]]]XX]]]]][1',
  '1[]]]]]]]]]]]][1', '1[[[[[[[[[[[[[[1', '1[]]]]]]]]]]]][1', '1[]]]]]XX]]]]][1',
  '1[]]]]]]]]]]]][1', '1[[[[[[[[[[[[[[1', '1[]]]]]]]]]]]][1', '1[]]]]]XX]]]]][1',
  '1[]]]]]]]]]]]][1', '1[[[[[[[[[[[[[[1', '1111111111111111', '1111111111111111',
], { solid: true });
def('benchPress', [
  '1111111111111111', '1111111111111111', '1XX11111111111XX'.slice(0, 16), '1XXXXXXXXXXXXXX1',
  '1XX11111111111X1'.slice(0, 16), 'XXX1::::::::1XXX', 'XXX1::::::::1XXX', '1XX1::::::::1XX1',
  '1111::::::::1111', '1111::::::::1111', '1111::::::::1111', '1111XXXXXXXX1111',
  '11111XX11XX11111', '11111XX11XX11111', '1111111111111111', '1111111111111111',
], { solid: true });
def('plant', [
  '1111111111111111', '1111111111111111', '11111TtT11111111', '1111TtTtT1111111',
  '111TtTtTtT111111', '111tTtTtTt111111', '1111TtTtT1111111', '11111TTT11111111',
  '111111{{11111111', '11111{{{{1111111', '11111{}}{1111111', '11111{{{{1111111',
  '111111{{11111111', '1111111111111111', '1111111111111111', '1111111111111111',
], { solid: true });
def('stainBucket', [
  '1111111111111111', '1111111111111111', '111~~~~~~~~~1111', '11~~~^^^^~~~~111',
  '11~~^^^^^^^~~~11', '111~~^^^^^~~~111', '1111~~~~~~~11111', '1111111111111111',
  '111111[[[[[11111', '11111[]]]]][1111', '11111[]]]]][1111', '11111[]]]]][1111',
  '11111[]]]]][1111', '11111[[[[[[[1111', '1111111111111111', '1111111111111111',
], { solid: true });
def('thermostat', [
  '5555555555555555', '3333333333333333', '@@@@@@@@@@@@@@@@', '3333333333333333',
  '3333wwwwwwww3333', '3333w[[[[[[w3333', '3333w[XXXX[w3333', '3333w[X&&X[w3333',
  '3333w[X&&X[w3333', '3333w[XXXX[w3333', '3333w[[[[[[w3333', '3333wwwwwwww3333',
  '3333333333333333', '3333333333333333', '3333333333333333', '3333333333333333',
], { solid: true });
def('cafeCounter', [
  '7777777787777777', 'VVVVVVVVVVVVVVVV', 'V{{{{{{{{{{{{{{V', 'V{{{{{{{{{{{{{{V',
  'V{{{{{{{{{{{{{{V', 'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuVuuVuuVuuVuuV',
  'VuuuuuuuuuuuuuuV', 'VVVVVVVVVVVVVVVV', '7777777787777777', '7777777787777777',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
], { solid: true });
def('espresso', [
  '7777777787777777', '77[[[[[[[[[[[[77', '77[]]]]]]]]]]]77'.slice(0, 16), '77[]X]]&$]]]X]77'.slice(0, 16),
  '77[]]]]]]]]]]]77'.slice(0, 16), '77[[[[[[[[[[[[77', '777]]]]77]]]]777', '777*****]]]]]777'.slice(0, 16),
  'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuVuuVuuVuuVuuV', 'VVVVVVVVVVVVVVVV',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
], { solid: true });
def('pastryCase', [
  '7777777787777777', 'V[[[[[[[[[[[[[[V', 'V[############[V', 'V[#%%##{{##%%#[V',
  'V[#%%##{{##%%#[V', 'V[############[V', 'V[#::##%%##::#[V', 'V[############[V',
  'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuVuuVuuVuuVuuV', 'VVVVVVVVVVVVVVVV',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
]);
T['pastryCase'].solid = true;
def('cafeTable', [
  '7777777787777777', '7777777787777777', '77VVVVVVVVVVVV77', '7Vuuuuuuuuuuuu V'.replace(' ', 'u').slice(0, 16),
  '7VuuuuuuuuuuuuV7', '7Vuuu*uuuu*uuuV7', '7VuuuuuuuuuuuuV7', '7VVVVVVVVVVVVVV7',
  '777777VVVV777777', '7777777VV7777777', '7777777VV7777777', '77777VVVVVV77777',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
], { solid: true });
def('cafeChair', [
  '7777777787777777', '77777VVVVVV77777', '7777V{{{{{{V7777', '7777V{{{{{{V7777',
  '7777VVVVVVVV7777', '7777V{{{{{{V7777', '7777V{{{{{{V7777', '7777VVVVVVVV7777',
  '7777V777777V7777', '7777V777777V7777', '7777777787777777', '7777777787777777',
  '8888888888888888', '7778777777787777', '7778777777787777', '8888888888888888',
], { solid: true });
def('chalkboard', [
  '5555555555555555', 'PPPPPPPPPPPPPPPP', 'pVVVVVVVVVVVVVVp', 'pVXXXXXXXXXXXXVp',
  'pVX*X*XX*X*X*XVp', 'pVXXXXXXXXXXXXVp', 'pVX%%X%X%%X%XXVp', 'pVXXXXXXXXXXXXVp',
  'pVX*XX*X*XX*XXVp', 'pVXXXXXXXXXXXXVp', 'pVVVVVVVVVVVVVVp', 'pppppppppppppppp',
  'pppppppppppppppp', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu', 'VVVVVVVVVVVVVVVV',
], { solid: true });
def('cityCounter', [
  '9999999909999999', 'VVVVVVVVVVVVVVVV', 'V99999999999999V', 'V99999999999999V',
  'V99999999999999V', 'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuuuVuuuuVuuuuV',
  'VuuuuuuuuuuuuuuV', 'VVVVVVVVVVVVVVVV', '9999999909999999', '9999999909999999',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
], { solid: true });
def('numberDispenser', [
  '9999999909999999', '9999999909999999', '99999:::::999999', '9999:::::::99999',
  '9999:::::::99999', '9999::***::99999', '9999::*XX::99999', '9999:::::::99999',
  '99999:::::999999', '9999999XX9999999', '9999999XX9999999', '9999999XX9999999',
  '999999XXXX999999', '9999999909999999', '9999999909999999', '0000000000000000',
], { solid: true });
def('waitChair', [
  '9999999909999999', '9999XXXXXXXX9999', '9999X++++++X9999', '9999X++++++X9999',
  '9999X++++++X9999', '9999XXXXXXXX9999', '9999X++++++X9999', '9999X++++++X9999',
  '9999X++++++X9999', '9999XXXXXXXX9999', '9999X999999X9999', '9999X999999X9999',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
], { solid: true });
def('bulletin', [
  '5555555555555555', '0000000000000000', '9VVVVVVVVVVVVVV9', '9VuuuuuuuuuuuuV9',
  '9Vu**u%%uu**uuV9', '9Vu**u%%uu**uuV9', '9VuuuuuuuuuuuuV9', '9Vu##uu**u%%uuV9',
  '9Vu##uu**u%%uuV9', '9VuuuuuuuuuuuuV9', '9VVVVVVVVVVVVVV9', 'wwwwwwwwwwwwwwww',
  'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu', 'VVVVVVVVVVVVVVVV',
], { solid: true });
def('mayorPortrait', [
  '5555555555555555', '0000000000000000', '99%%%%%%%%%%%%99', '99%VVVVVVVVVVV%9'.slice(0, 16),
  '99%Vkkkkkkkk V%9'.replace(' ', 'k').slice(0, 16), '99%Vkkssssskkkkk'.slice(0, 14) + '%9', '99%Vkksesesskk%9'.slice(0, 16), '99%Vkkssssskkk%9'.slice(0, 16),
  '99%Vkk:::::kkk%9'.slice(0, 16), '99%VVVVVVVVVVV%9'.slice(0, 16), '99%%%%%%%%%%%%99', 'wwwwwwwwwwwwwwww',
  'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu', 'uuuuuuuuuuuuuuuu', 'VVVVVVVVVVVVVVVV',
], { solid: true });
def('grantDesk', [
  '9999999909999999', 'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'Vu*******uuuuuuV',
  'Vu*******u*****V', 'Vu*******u*****V', 'Vu*******u*****V', 'Vu*******uuuuuuV',
  'VuuuuuuuuuuuuuuV', 'VVVVVVVVVVVVVVVV', 'VV999999999999VV', 'VV999999999999VV',
  '9999999909999999', '9999999909999999', '9999999909999999', '0000000000000000',
], { solid: true });
def('pew', [
  '{{{{{{{}{{{{{{{}', 'VVVVVVVVVVVVVVVV', 'VuuuuuuuuuuuuuuV', 'VuuuuuuuuuuuuuuV',
  'VVVVVVVVVVVVVVVV', 'V::::::::::::::V', 'V::::::::::::::V', 'V::::::::::::::V',
  'VVVVVVVVVVVVVVVV', 'VV{{{{{{{{{{{{VV', 'VV{{{{{{{{{{{{VV', '{{{}{{{{{{{}{{{{',
  '}}}}}}}}}}}}}}}}', '{{{{{{{}{{{{{{{}', '{{{{{{{}{{{{{{{}', '}}}}}}}}}}}}}}}}',
], { solid: true });
def('altar', [
  '5555555555555555', 'pppppppppppppppp', 'ppppppp%%ppppppp', 'ppppppp%%ppppppp',
  'ppppp%%%%%%ppppp', 'ppppppp%%ppppppp', 'ppppppp%%ppppppp', 'ppppppp%%ppppppp',
  'ppppppp%%ppppppp', 'pppVVVVVVVVVVppp', 'pppVwwwwwwwwVppp', 'pppVwwwwwwwwVppp',
  'pppVVVVVVVVVVppp', 'VVVVVVVVVVVVVVVV', 'VVVVVVVVVVVVVVVV', 'uuuuuuuuuuuuuuuu',
], { solid: true });
def('lightPool', [
  '{{{{{{{}{{{{{{{}', '{{{{"""""""{{{{}', '{{{""""\'\'\'""""{{'.slice(0, 16), '{{""""\'\'\'\'\'""""{'.slice(0, 16),
  '{{"""\'\'\'\'\'\'\'"""{'.slice(0, 16), '{""""\'\'\'\'\'\'\'"""}'.slice(0, 16), '{""""\'\'\'\'\'\'\'"""}'.slice(0, 16), '{{"""\'\'\'\'\'\'\'"""{'.slice(0, 16),
  '{{""""\'\'\'\'\'""""{'.slice(0, 16), '{{{""""\'\'\'""""{{'.slice(0, 16), '{{{{"""""""{{{{}', '}}}}}}}}}}}}}}}}',
  '{{{{{{{}{{{{{{{}', '{{{{{{{}{{{{{{{}', '}}}}}}}}}}}}}}}}', '{{{}{{{{{{{}{{{{',
]);
def('flowerBed', [
  'kkkkkkkkkkkkkkkk', 'kfkFkfkFkfkFkfkk', 'kWkWkWkWkWkWkWkk', 'kfkFkfkFkfkFkfkk',
  'kkkkkkkkkkkkkkkk', 'kFkfkFkfkFkfkFkk', 'kWkWkWkWkWkWkWkk', 'kFkfkFkfkFkfkFkk',
  'kkkkkkkkkkkkkkkk', 'kfkFkfkFkfkFkfkk', 'kWkWkWkWkWkWkWkk', 'kfkFkfkFkfkFkfkk',
  'kkkkkkkkkkkkkkkk', 'kkkkkkkkkkkkkkkk', 'gggggggggggggggg', 'gggggggggggggggg',
], { solid: true });
def('gardenPath', [
  'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg', 'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg',
  'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg', 'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg',
  'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg', 'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg',
  'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg', 'gQqQqQqQqQqQqQqg', 'gqQqQqQqQqQqQqQg',
]);
def('void', textured(16, 16, '5', [], 0, 1), { solid: true });


def('truckL', [
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaXXXXXXX',
  'aaaaaaaaX;;;;;;;',
  'aaaaaaaX;;;;;;;;',
  'aaaaaXXX;;;;;;;;',
  'aaaaX::::::::::;',
  'aaaX:::nnnnn:::;',
  'aaX::::nnnnn::::',
  'aX:::::nnnnn::::',
  'aX::::::::::::::',
  'aX::::::::::::::',
  'aXXXXXXXXXXXXXXX',
  'aaaXXXaaaaaaaaaa',
  'aaXX]XXaaaaaaaaa',
  'aaaXXXaaaaaaaaaa',
], { solid: true });
def('truckR', [
  'aaaaaaaaaaaaaaaa',
  'aaaaaaaaaaaaaaaa',
  'XXXXXXXXXXXXXaaa',
  ';;;;;;;;;;;;;Xaa',
  ';;;;;;;;;;;;;Xaa',
  ';;;;;;;;;;;;;Xaa',
  ';:::::::::::::Xa',
  ';:::::::::::::Xa',
  '::::::::::::::Xa',
  '::::::::::::::Xa',
  '::::::::::::::Xa',
  '::::::::::::::Xa',
  'XXXXXXXXXXXXXXXa',
  'aaaaaaaaaXXXaaaa',
  'aaaaaaaaXX]XXaaa',
  'aaaaaaaaaXXXaaaa',
], { solid: true });
def('roofEdgeGrayWhite', [
  'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo', 'oooooooooooooooo', 'OOOoOOOOOOOoOOOO',
  'OOOoOOOOOOOoOOOO', 'oooooooooooooooo', 'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo',
  'oooooooooooooooo', 'OOOoOOOOOOOoOOOO', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv',
  'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww',
], { solid: true });
def('roofEdgeGrayBrick', [
  'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo', 'oooooooooooooooo', 'OOOoOOOOOOOoOOOO',
  'OOOoOOOOOOOoOOOO', 'oooooooooooooooo', 'OOOOOOOoOOOOOOOo', 'OOOOOOOoOOOOOOOo',
  'oooooooooooooooo', 'OOOoOOOOOOOoOOOO', 'wwwwwwwwwwwwwwww', 'vvvvvvvvvvvvvvvv',
  'BbbbbbbmBbbbbbbm', 'bbbbbbbmbbbbbbbm', 'bbbbbbbmbbbbbbbm', 'mmmmmmmmmmmmmmmm',
], { solid: true });
def('windowWhite', [
  'wwwwwwwwwwwwwwww', 'wwvvvvvvvvvvvvww', 'wwv#####v#####vw', 'wwv##*##v#####vw',
  'wwv#####v#####vw', 'wwv#####v#####vw', 'wwvvvvvvvvvvvvww', 'wwv#####v#####vw',
  'wwv#####v#####vw', 'wwv#####v#####vw', 'wwv#####v#####vw', 'wwvvvvvvvvvvvvww',
  'wwvvvvvvvvvvvvww', 'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww', 'wwwwwwwwwwwwwwww',
], { solid: true });
def('doorWhite', [
  'wwwwwwwwwwwwwwww', 'wwVVVVVVVVVVVVww', 'wwVuuuuuuuuuuVww', 'wwVuVVVuuVVVuVww',
  'wwVuVuVuuVuVuVww', 'wwVuVVVuuVVVuVww', 'wwVuuuuuuuuuuVww', 'wwVuuuuuuuuuuVww',
  'wwVuuuuuuuu%uVww', 'wwVuuuuuuuuuuVww', 'wwVuVVVuuVVVuVww', 'wwVuVuVuuVuVuVww',
  'wwVuVVVuuVVVuVww', 'wwVuuuuuuuuuuVww', 'wwVVVVVVVVVVVVww', 'cccccccccccccccc',
]);
def('ringPost', [
  'pppppppppppppppp'.replace(/p/g,'1'), '1111111XX1111111', '111111X&&X111111', '111111X&&X111111',
  '1111111XX1111111', '111111%%%%111111', '1111111XX1111111', '1111111XX1111111',
  '111111####111111', '1111111XX1111111', '1111111XX1111111', '111111&&&&111111',
  '1111111XX1111111', '1111111XX111111 1'.replace(' ',''), '111111XXXX111111', '1111111111111111',
], { solid: true });
def('ringMat', [
  '****************', '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*',
  '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*',
  '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*',
  '*::::::::::::::*', '*::::::::::::::*', '*::::::::::::::*', '****************',
]);

export const TILES = T;
export const TILE_NAMES = Object.keys(T);
