import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldScene } from './scenes/WorldScene';
import { UIScene } from './scenes/UIScene';
import { EncounterScene } from './scenes/EncounterScene';
import { EndingScene } from './scenes/EndingScene';
import { W, H, session } from './engine/session';
import { audio } from './engine/audio';
import { input } from './engine/input';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#101018',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H,
  },
  render: { pixelArt: true, antialias: false, roundPixels: true },
  audio: { noAudio: true }, // we use our own WebAudio engine
  scene: [BootScene, TitleScene, WorldScene, UIScene, EncounterScene, EndingScene],
};

const game = new Phaser.Game(config);
// Clear one-shot key presses once per frame, after every scene has had a chance to consume them.
game.events.on(Phaser.Core.Events.POST_STEP, () => input.endFrame());

// Debug / test hooks (harmless in production; used by automated tests)
declare global {
  interface Window { __heman?: { game: Phaser.Game; session: typeof session; audio: typeof audio; input: typeof input } }
}
window.__heman = { game, session, audio, input };

// Keep the touch layout in sync with the canvas size: on portrait phones the canvas sits at the top
function layout(): void {
  const app = document.getElementById('app');
  if (!app) return;
  const portrait = window.innerHeight > window.innerWidth;
  if (document.body.classList.contains('touch') && portrait) {
    app.style.justifyContent = 'flex-start';
    app.style.paddingTop = '8px';
  } else {
    app.style.justifyContent = 'center';
    app.style.paddingTop = '0';
  }
}
window.addEventListener('resize', layout);
layout();
