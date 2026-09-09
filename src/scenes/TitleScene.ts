import Phaser from 'phaser';
import { PERSONAL } from '../config/personal';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import { Game, newGameState } from '../engine/state';
import { box, text, COLORS } from '../engine/ui';
import { portraitKey } from '../engine/textures';

export class TitleScene extends Phaser.Scene {
  private cursor = 0;
  private options: string[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private confirming = false;
  private confirmBox?: Phaser.GameObjects.Container;
  private confirmCursor = 1;
  private hint!: Phaser.GameObjects.Text;
  private hasSave = false;

  constructor() { super('Title'); }

  create(): void {
    this.hasSave = Game.hasSave();
    this.cameras.main.setBackgroundColor('#101018');
    // background: warehouse silhouette + stars
    const g = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, 0.3 + (i % 5) * 0.12);
      g.fillRect((i * 97) % W, (i * 53) % 120, 1, 1);
    }
    g.fillStyle(0x2a2a3a, 1); g.fillRect(0, 150, W, 90);
    g.fillStyle(0x6b5a3e, 1); g.fillRect(300, 100, 100, 50);
    g.fillStyle(0x4b4b55, 1); g.fillRect(296, 92, 104, 10);
    g.fillStyle(0x8f8677, 1); g.fillRect(266, 112, 44, 38);
    g.fillStyle(0x2e5a3a, 1); g.fillTriangle(260, 114, 288, 92, 316, 114);
    g.fillStyle(0x1c2a3a, 1); g.fillRect(282, 128, 12, 22);
    g.fillStyle(0xffd27f, 1); g.fillRect(280, 118, 16, 4);
    g.fillStyle(0x3c3c44, 1); g.fillRect(0, 150, W, 40);
    for (let x = 0; x < W; x += 24) { g.fillStyle(0x9a9a90, 1); g.fillRect(x + 4, 170, 12, 1); }

    // title
    text(this, W / 2, 34, PERSONAL.gameTitle.toUpperCase(), { size: 16, color: COLORS.accent, align: 'center' }).setOrigin(0.5);
    text(this, W / 2, 56, PERSONAL.gameSubtitle.toUpperCase(), { size: 8, color: '#ffffff', align: 'center' }).setOrigin(0.5);
    text(this, W / 2, 72, `A ${PERSONAL.churchName} adventure`, { size: 8, color: COLORS.dim, align: 'center' }).setOrigin(0.5);

    // hero portrait
    const p = this.add.image(60, 118, portraitKey(this, 'erik', 'happy')).setScale(2).setOrigin(0.5);
    this.tweens.add({ targets: p, y: 122, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.options = this.hasSave ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
    this.optionTexts = this.options.map((o, i) => text(this, W / 2 - 24, 118 + i * 16, o, { align: 'center' }).setOrigin(0.5));
    this.hint = text(this, W / 2, 200, input.isTouch ? 'TAP A TO START' : 'PRESS SPACE / ENTER TO START', { color: COLORS.dim, align: 'center' }).setOrigin(0.5);
    this.tweens.add({ targets: this.hint, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    text(this, W / 2, 222, `v${PERSONAL.version}  ·  M: mute  ·  arrows/WASD move  ·  Esc: menu`, { color: '#666a80', align: 'center', size: 8 }).setOrigin(0.5).setScale(0.75);
    this.updateCursor();
    input.clear();
  }

  private updateCursor(): void {
    this.optionTexts.forEach((t, i) => {
      t.setColor(i === this.cursor ? COLORS.accent : COLORS.text);
      t.setText((i === this.cursor ? '> ' : '  ') + this.options[i] + (i === this.cursor ? ' <' : '  '));
    });
  }

  update(): void {
    if (this.confirming) {
      if (input.consume('left') || input.consume('right') || input.consume('up') || input.consume('down')) {
        this.confirmCursor = 1 - this.confirmCursor; audio.sfx('move'); this.drawConfirm();
      }
      if (input.consume('a')) {
        if (this.confirmCursor === 0) { audio.sfx('confirm'); this.startNew(); }
        else { audio.sfx('cancel'); this.closeConfirm(); }
      }
      if (input.consume('b')) { audio.sfx('cancel'); this.closeConfirm(); }
        return;
    }
    if (input.consume('up')) { this.cursor = (this.cursor + this.options.length - 1) % this.options.length; audio.unlock(); audio.sfx('move'); this.updateCursor(); }
    if (input.consume('down')) { this.cursor = (this.cursor + 1) % this.options.length; audio.unlock(); audio.sfx('move'); this.updateCursor(); }
    if (input.consume('menu')) { audio.unlock(); audio.setMute(!audio.muted); session.game.state.mute = audio.muted; }
    if (input.consume('a')) {
      audio.unlock();
      audio.sfx('confirm');
      const choice = this.options[this.cursor];
      if (choice === 'CONTINUE') this.continueGame();
      else if (this.hasSave) this.openConfirm();
      else this.startNew();
    }
  }

  private openConfirm(): void {
    this.confirming = true;
    this.confirmCursor = 1;
    this.drawConfirm();
  }
  private drawConfirm(): void {
    this.confirmBox?.destroy();
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    box(g, 80, 90, 240, 70);
    c.add(g);
    c.add(text(this, W / 2, 104, 'Start a new game?', { align: 'center' }).setOrigin(0.5));
    c.add(text(this, W / 2, 118, 'Your saved quest will be erased.', { align: 'center', color: COLORS.dim }).setOrigin(0.5).setScale(0.75));
    c.add(text(this, 130, 140, (this.confirmCursor === 0 ? '> ' : '  ') + 'YES', { color: this.confirmCursor === 0 ? COLORS.bad : COLORS.text }));
    c.add(text(this, 230, 140, (this.confirmCursor === 1 ? '> ' : '  ') + 'NO', { color: this.confirmCursor === 1 ? COLORS.accent : COLORS.text }));
    this.confirmBox = c;
  }
  private closeConfirm(): void {
    this.confirming = false;
    this.confirmBox?.destroy();
    this.confirmBox = undefined;
  }

  private startNew(): void {
    Game.clearSave();
    session.game = new Game(newGameState());
    session.game.state.mute = audio.muted;
    session.started = true;
    this.launchWorld();
  }
  private continueGame(): void {
    const loaded = Game.load();
    session.game = new Game(loaded ?? newGameState());
    audio.setMute(!!session.game.state.mute);
    session.started = true;
    this.launchWorld();
  }
  private launchWorld(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('World');
      this.scene.launch('UI');
    });
  }
}
