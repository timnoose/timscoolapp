import Phaser from 'phaser';
import { generateTileset, generateCharacters, generateUI } from '../engine/textures';
import { input } from '../engine/input';
import { W, H } from '../engine/session';
import { text } from '../engine/ui';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create(): void {
    input.init();
    const label = text(this, W / 2, H / 2, 'LOADING...', { align: 'center' }).setOrigin(0.5);
    const go = () => {
      generateTileset(this);
      generateCharacters(this);
      generateUI(this);
      label.destroy();
      this.scene.start('Title');
    };
    // make sure the pixel font is ready before any text is drawn
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts && fonts.load) {
      Promise.race([
        Promise.all([fonts.load('8px PressStart'), fonts.load('8px "Press Start 2P"')]).then(() => fonts.ready),
        new Promise((r) => setTimeout(r, 2500)),
      ]).then(go, go);
    } else go();
  }
}
