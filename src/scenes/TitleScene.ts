import Phaser from 'phaser';
import { PERSONAL } from '../config/personal';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import { Game, newGameState } from '../engine/state';
import { box, text, COLORS } from '../engine/ui';
import { MAPS } from '../data/maps';
import { buildLayers } from '../engine/tilemap';
import { TILE } from '../engine/textures';

/**
 * Title card: a live vignette of the warehouse church (rendered from the real town map),
 * the hero flexing, a chunky logo, and a couple of townsfolk going about their day.
 * Composed so the middle band also works as a 1200x630 link preview.
 */
export class TitleScene extends Phaser.Scene {
  private cursor = 0;
  private options: string[] = [];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private confirming = false;
  private confirmBox?: Phaser.GameObjects.Container;
  private confirmCursor = 1;
  private hasSave = false;
  private heli?: Phaser.GameObjects.Image;
  private heliShadow?: Phaser.GameObjects.Image;

  constructor() { super('Title'); }

  create(): void {
    this.hasSave = Game.hasSave();
    const cam = this.cameras.main;
    cam.setBackgroundColor('#3c5a30');

    // ---- world vignette: the church front and its parking lot ----
    const town = MAPS.town;
    buildLayers(this, town);
    cam.setScroll(12 * TILE, 21 * TILE); // church roof at the top, lot at the bottom
    this.addTownsfolk();

    // dusk tint + top band for the logo
    const shade = this.add.graphics().setScrollFactor(0).setDepth(20);
    shade.fillStyle(0x0a0c1a, 0.42); shade.fillRect(0, 0, W, H);
    shade.fillGradientStyle(0x05060f, 0x05060f, 0x05060f, 0x05060f, 0.85, 0.85, 0.15, 0.15);
    shade.fillRect(0, 0, W, 104);
    shade.fillGradientStyle(0x05060f, 0x05060f, 0x05060f, 0x05060f, 0.0, 0.0, 0.75, 0.75);
    shade.fillRect(0, 150, W, 90);

    // little stars in the dark band
    const stars = this.add.graphics().setScrollFactor(0).setDepth(21);
    for (let i = 0; i < 40; i++) {
      stars.fillStyle(0xffffff, 0.25 + (i % 4) * 0.15);
      stars.fillRect((i * 97 + 13) % W, (i * 41) % 60 + 4, 1, 1);
    }

    // ---- logo ----
    const garnet = '#73000a';
    const line1 = text(this, W / 2, 26, PERSONAL.gameTitle.toUpperCase(), { size: 16, color: COLORS.accent, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(30);
    line1.setStroke(garnet, 4).setShadow(2, 3, '#000000', 0, true, true);
    const line2 = text(this, W / 2, 58, PERSONAL.gameSubtitle.toUpperCase(), { size: 8, color: '#ffffff', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    // ribbon behind the subtitle
    const ribbon = this.add.graphics().setScrollFactor(0).setDepth(30);
    const rw = line2.width + 28;
    ribbon.fillStyle(0x73000a, 1); ribbon.fillRect(W / 2 - rw / 2, 50, rw, 16);
    ribbon.fillStyle(0x4a0006, 1); ribbon.fillRect(W / 2 - rw / 2, 64, rw, 2);
    ribbon.fillStyle(0xffd27f, 1); ribbon.fillRect(W / 2 - rw / 2 - 6, 52, 4, 12); ribbon.fillRect(W / 2 + rw / 2 + 2, 52, 4, 12);
    // bolts flanking the title
    this.add.image(W / 2 - line1.width / 2 - 18, 26, 'bolt').setScale(2).setScrollFactor(0).setDepth(31);
    this.add.image(W / 2 + line1.width / 2 + 18, 26, 'bolt').setScale(-2, 2).setScrollFactor(0).setDepth(31);
    const nameLine = text(this, W / 2, 80, `${PERSONAL.churchFullName.toUpperCase()}  -  ${PERSONAL.townName.toUpperCase()}, TN`, { color: '#e8e8f0', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(31).setScale(0.75);
    const pill = this.add.graphics().setScrollFactor(0).setDepth(30);
    pill.fillStyle(0x05060f, 0.75); pill.fillRect(W / 2 - nameLine.displayWidth / 2 - 6, 74, nameLine.displayWidth + 12, 12);

    // logo entrance
    line1.setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: line1, scale: 1, alpha: 1, duration: 500, ease: 'Back.out' });

    // ---- the hero, flexing ----
    const hero = this.add.sprite(64, 238, 'char-erik-flex', 0).setOrigin(0.5, 1).setScale(4).setScrollFactor(0).setDepth(40);
    hero.play('erik-flex');
    const heroShadow = this.add.ellipse(64, 236, 56, 12, 0x000000, 0.35).setScrollFactor(0).setDepth(39);
    void heroShadow;
    const tag = text(this, 64, 132, PERSONAL.heroNickname.toUpperCase(), { color: COLORS.accent, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setScale(0.75);
    tag.setStroke('#000000', 3);

    // ---- menu ----
    const mg = this.add.graphics().setScrollFactor(0).setDepth(40);
    box(mg, 236, 150, 152, this.hasSave ? 62 : 48);
    this.options = this.hasSave ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
    this.optionTexts = this.options.map((o, i) => text(this, 312, 164 + i * 16, o, { align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(41));
    const hint = text(this, 312, this.hasSave ? 200 : 186, input.isTouch ? 'TAP A' : 'SPACE / ENTER', { color: COLORS.dim, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setScale(0.75);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
    text(this, W - 4, H - 10, `v${PERSONAL.version}  M: mute`, { color: '#666a80', align: 'right' }).setOrigin(1, 0).setScrollFactor(0).setDepth(41).setScale(0.75);
    text(this, 4, H - 10, `made with love by ${PERSONAL.sageName}`, { color: '#666a80' }).setOrigin(0, 0).setScrollFactor(0).setDepth(41).setScale(0.75);
    this.updateCursor();

    // ---- a Blackhawk from post, every so often ----
    this.heliShadow = this.add.image(-40, 130, 'heli').setAlpha(0.18).setTint(0x000000).setScrollFactor(0).setDepth(19);
    this.heli = this.add.image(-40, 12, 'heli').setScrollFactor(0).setDepth(32);
    this.time.addEvent({ delay: 7000, loop: true, callback: () => this.flyover(), startAt: 4500 });

    input.clear();
  }

  private addTownsfolk(): void {
    const at = (tx: number, ty: number) => ({ x: tx * TILE + 8, y: ty * TILE + 16 });
    // Ronnie by his truck, looking around
    const r = at(25, 30);
    const ronnie = this.add.sprite(r.x, r.y, 'char-ronnie', 6).setOrigin(0.5, 1).setDepth(10);
    this.time.addEvent({ delay: 2200, loop: true, callback: () => ronnie.setFrame(ronnie.frame.name === '6' ? 9 : 6) });
    // Mason pacing the lot
    const m = at(21, 32);
    const mason = this.add.sprite(m.x, m.y, 'char-mason', 9).setOrigin(0.5, 1).setDepth(10);
    mason.play('char-mason-walk-right');
    this.tweens.add({ targets: mason, x: at(25, 32).x, duration: 3200, yoyo: true, repeat: -1, ease: 'Linear', onYoyo: () => mason.play('char-mason-walk-left'), onRepeat: () => mason.play('char-mason-walk-right') });
    // Reyes walking up the sidewalk in front of the church
    const s = at(33, 28);
    const reyes = this.add.sprite(s.x, s.y, 'char-reyes', 6).setOrigin(0.5, 1).setDepth(10);
    reyes.play('char-reyes-walk-left');
    this.tweens.add({ targets: reyes, x: at(23, 28).x, duration: 7000, repeat: -1, ease: 'Linear', repeatDelay: 1500, onRepeat: () => { reyes.x = s.x; } });
    // Tasha on the church steps, facing us
    const t = at(19, 28);
    this.add.sprite(t.x, t.y, 'char-tasha', 0).setOrigin(0.5, 1).setDepth(10);
  }

  private flyover(): void {
    if (!this.heli || !this.heliShadow) return;
    this.heli.setPosition(W + 40, 10 + Math.random() * 14);
    this.heliShadow.setPosition(W + 60, 128 + Math.random() * 30);
    this.tweens.add({ targets: this.heli, x: -40, duration: 3600, ease: 'Linear' });
    this.tweens.add({ targets: this.heliShadow, x: -60, duration: 3600, ease: 'Linear' });
    if (!audio.muted) audio.sfx('thud');
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
      audio.play('title');
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
    const c = this.add.container(0, 0).setDepth(100).setScrollFactor(0);
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
