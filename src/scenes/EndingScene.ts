import Phaser from 'phaser';
import { MAPS } from '../data/maps';
import { TILE, TILE_INDEX, portraitKey } from '../engine/textures';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import { box, text, wrap, COLORS } from '../engine/ui';
import { ENDING_SCRIPT, ENDING_CREDITS, type EndingLine } from '../data/dialogue';
import { castName } from '../data/cast';
import { PERSONAL } from '../config/personal';

const DIR_FRAME = { down: 0, up: 3, left: 6, right: 9 } as const;

export class EndingScene extends Phaser.Scene {
  private kind: 'buy' | 'build' = 'buy';
  private lines: EndingLine[] = [];
  private idx = 0;
  private g!: Phaser.GameObjects.Graphics;
  private msg!: Phaser.GameObjects.Text;
  private name!: Phaser.GameObjects.Text;
  private portrait!: Phaser.GameObjects.Image;
  private typed = 0;
  private typeTimer = 0;
  private current = '';
  private phase: 'walk' | 'talk' | 'credits' | 'done' = 'walk';
  private player!: Phaser.GameObjects.Sprite;
  private creditsContainer?: Phaser.GameObjects.Container;
  private creditsTween?: Phaser.Tweens.Tween;
  private uiContainer!: Phaser.GameObjects.Container;
  private mapW = 0;
  private mapH = 0;

  constructor() { super('Ending'); }

  init(data: { kind: 'buy' | 'build' }): void { this.kind = data.kind ?? 'buy'; this.idx = 0; this.phase = 'walk'; }

  create(): void {
    const def = MAPS[this.kind === 'buy' ? 'chapel' : 'campus'];
    this.mapW = def.w * TILE; this.mapH = def.h * TILE;
    const tm = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: def.w, height: def.h });
    const tileset = tm.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0, 1)!;
    const ground = tm.createBlankLayer('ground', tileset)!;
    const objects = tm.createBlankLayer('objects', tileset)!;
    for (let j = 0; j < def.h; j++) for (let i = 0; i < def.w; i++) {
      ground.putTileAt(TILE_INDEX[def.ground[j][i] ?? def.fill] + 1, i, j);
      const o = def.objects[j][i];
      if (o) objects.putTileAt(TILE_INDEX[o] + 1, i, j);
    }
    // warm light overlay
    const warm = this.add.graphics();
    warm.fillStyle(0xffb347, 0.08); warm.fillRect(0, 0, this.mapW, this.mapH);

    // congregation lined up in the aisle facing down
    const g = session.game;
    const cx = Math.floor(def.w / 2);
    const cast = ['tim', 'kyle', 'tasha', 'ronnie', 'doug', 'marcus', 'janet', 'brayden', 'member1', 'member2'];
    if (g.isAlly('pruitt')) cast.push('pruitt');
    if (g.isAlly('gary')) cast.push('gary');
    if (g.isAlly('linda')) cast.push('linda');
    if (g.isAlly('harold')) cast.push('harold');
    if (g.isAlly('whitlock')) cast.push('whitlock');
    if (g.isAlly('dale')) cast.push('dale');
    if (g.isAlly('tonya')) cast.push('tonya');
    cast.push(this.kind === 'buy' ? 'brenda' : 'hank');
    cast.forEach((id, i) => {
      const col = i % 2 === 0 ? cx - 1 : cx + 1;
      const row = 3 + Math.floor(i / 2);
      const x = col + (i % 4 >= 2 ? (i % 2 === 0 ? -1 : 1) : 0);
      const s = this.add.sprite(x * TILE + 8, row * TILE + 16, `char-${id}`, i % 2 === 0 ? DIR_FRAME.right : DIR_FRAME.left).setOrigin(0.5, 1);
      s.setDepth(10 + row);
    });
    this.player = this.add.sprite(cx * TILE + 8, (def.h - 1) * TILE + 16, 'char-erik', DIR_FRAME.up).setOrigin(0.5, 1).setDepth(50);

    const cam = this.cameras.main;
    cam.setBounds(Math.min(0, (this.mapW - W) / 2), Math.min(0, (this.mapH - H) / 2), Math.max(this.mapW, W), Math.max(this.mapH, H));
    cam.startFollow(this.player, true);
    cam.setBackgroundColor('#101018');
    audio.play('ending');

    // UI
    this.uiContainer = this.add.container(0, 0).setDepth(200).setScrollFactor(0);
    this.g = this.add.graphics();
    this.portrait = this.add.image(10, 186, portraitKey(this, 'erik', 'happy')).setOrigin(0, 0);
    this.msg = text(this, 50, 185, '', {});
    this.name = text(this, 53, 168, '', { color: COLORS.accent });
    this.uiContainer.add([this.g, this.portrait, this.msg, this.name]);
    this.uiContainer.setVisible(false);

    const title = text(this, W / 2, 30, this.kind === 'buy' ? 'SIX MONTHS LATER' : 'FOURTEEN MONTHS LATER', { color: COLORS.accent, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    const sub = text(this, W / 2, 46, this.kind === 'buy' ? PERSONAL.historicChurchName : PERSONAL.newBuildName, { align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    this.tweens.add({ targets: [title, sub], alpha: 0, delay: 2600, duration: 600 });
    cam.fadeIn(1200, 0, 0, 0);

    // walk up the aisle
    this.player.anims.play('char-erik-walk-up', true);
    this.tweens.add({
      targets: this.player, y: (def.h - 9) * TILE + 16, duration: 3200, delay: 1200, ease: 'Linear',
      onComplete: () => {
        this.player.anims.stop(); this.player.setFrame(DIR_FRAME.up);
        this.lines = ENDING_SCRIPT(this.kind, session.game);
        this.phase = 'talk';
        this.uiContainer.setVisible(true);
        this.showLine();
      },
    });
    input.clear();
  }

  private showLine(): void {
    if (this.idx >= this.lines.length) { this.startCredits(); return; }
    const l = this.lines[this.idx++];
    this.g.clear();
    box(this.g, 2, 176, W - 4, H - 178);
    if (l.who) {
      this.portrait.setTexture(portraitKey(this, l.who, l.mood ?? 'happy')).setVisible(true);
      this.g.fillStyle(0xf4f4f0, 1); this.g.fillRect(8, 184, 36, 36);
      this.g.fillStyle(0x101018, 1); this.g.fillRect(10, 186, 32, 32);
      this.name.setText(castName(l.who)).setVisible(true);
      box(this.g, 48, 164, this.name.width + 10, 16);
      this.msg.setX(50);
    } else { this.portrait.setVisible(false); this.name.setVisible(false); this.msg.setX(12); }
    this.current = wrap(l.text, l.who ? 41 : 45).join('\n');
    this.typed = 0; this.typeTimer = 0;
    this.msg.setText('');
  }

  private startCredits(): void {
    this.phase = 'credits';
    this.uiContainer.setVisible(false);
    const lines = ENDING_CREDITS(this.kind, session.game);
    const c = this.add.container(0, H).setDepth(400).setScrollFactor(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.75); bg.fillRect(0, -H, W, lines.length * 14 + H * 3);
    c.add(bg);
    let y = 0;
    for (const l of lines) {
      const t = text(this, W / 2, y, l.text, { color: l.color ?? COLORS.text, align: 'center' }).setOrigin(0.5, 0);
      if (l.small) t.setScale(0.75);
      c.add(t);
      y += l.small ? 11 : 16;
    }
    const total = y + 40;
    this.creditsContainer = c;
    this.creditsTween = this.tweens.add({ targets: c, y: -total + H - 60, duration: Math.max(12000, lines.length * 900), ease: 'Linear', onComplete: () => {
      this.phase = 'done';
      const end = text(this, W / 2, H - 30, 'THE END  -  press A to return to title', { color: COLORS.accent, align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(500);
      this.tweens.add({ targets: end, alpha: 0.4, yoyo: true, repeat: -1, duration: 600 });
    } });
  }

  update(time: number, delta: number): void {
    if (this.phase === 'talk') {
      if (this.typed < this.current.length) {
        this.typeTimer += delta;
        const speed = input.isDown('a') ? 6 : 20;
        while (this.typeTimer > speed && this.typed < this.current.length) { this.typeTimer -= speed; this.typed++; if (this.typed % 3 === 0) audio.sfx('blip'); }
        this.msg.setText(this.current.slice(0, this.typed));
        if (input.consume('a')) { this.typed = this.current.length; this.msg.setText(this.current); }
      } else if (input.consume('a') || input.consume('b')) { audio.sfx('confirm'); this.showLine(); }
    } else if (this.phase === 'credits') {
      // holding A fast-forwards the credits
      if (this.creditsTween) this.creditsTween.timeScale = input.isDown('a') ? 8 : 1;
    } else if (this.phase === 'done') {
      if (input.consume('a') || input.consume('b')) {
        audio.sfx('confirm');
        session.game.set('finished_' + this.kind);
        session.game.save();
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => { audio.stop(); this.scene.start('Title'); });
      }
    }
  }
}
