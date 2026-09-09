/** Cross-scene singletons. */
import { Game } from './state';

export const session = {
  game: new Game(),
  /** Set when a saved game is loaded or a new game started. */
  started: false,
  debug: false,
};

export const W = 400;
export const H = 240;
