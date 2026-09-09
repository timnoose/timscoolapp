import Phaser from 'phaser';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import { box, text, meter, wrap, COLORS } from '../engine/ui';
import { portraitKey } from '../engine/textures';
import { ENCOUNTERS } from '../data/encounters';
import { fakeCurse, curseCorrection } from '../data/dialogue';
import { BALANCE } from '../data/balance';
import { PERSONAL } from '../config/personal';
import { canUse, createEncounter, effectivenessOf, hintFor, moveCost, MOVE_INFO, playerMove, type EncounterState, type MoveId, type TurnResult } from '../engine/encounter';
import type { Mood } from '../art/portraits';

type Phase = 'intro' | 'menu' | 'narrate' | 'end';
const MOVES: MoveId[] = ['listen', 'vision', 'coffee', 'volunteer', 'boundary', 'sage', 'meeting'];
const MENU_ITEMS: (MoveId | 'retreat')[] = [...MOVES, 'retreat'];

export class EncounterScene extends Phaser.Scene {
  private st!: EncounterState;
  private onDone!: (r: 'win' | 'lose') => void;
  private phase: Phase = 'intro';
  private queue: string[] = [];
  private afterQueue: (() => void) | null = null;
  private cursor = 0;
  private g!: Phaser.GameObjects.Graphics;
  private msg!: Phaser.GameObjects.Text;
  private oppPortrait!: Phaser.GameObjects.Image;
  private heroPortrait!: Phaser.GameObjects.Image;
  private resText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private menuContainer?: Phaser.GameObjects.Container;
  private typed = 0;
  private typeTimer = 0;
  private current = '';
  private arrow!: Phaser.GameObjects.Text;
  private result: 'win' | 'lose' | null = null;
  private title!: Phaser.GameObjects.Text;
  private concern!: Phaser.GameObjects.Text;
  private heroMood: Mood = 'neutral';
  private displayRes = 0;
  private displayEnergy = 0;

  constructor() { super('Encounter'); }

  init(data: { id: string; onDone: (r: 'win' | 'lose') => void }): void {
    const def = ENCOUNTERS[data.id];
    if (!def) throw new Error('Unknown encounter ' + data.id);
    const g = session.game;
    this.st = createEncounter(def, Math.max(20, g.state.energy), g.isAlly('ronnie'), PERSONAL.sageShort);
    const bonus = g.flag(def.id + 'Start');
    if (typeof bonus === 'number' && bonus > 0) { this.st.resolution = Math.min(def.target - 10, this.st.resolution + bonus); g.set(def.id + 'Start', 0); }
    this.onDone = data.onDone;
    this.phase = 'intro';
    this.result = null;
    this.queue = [];
    this.afterQueue = null;
    this.cursor = 0;
    this.displayRes = this.st.resolution;
    this.displayEnergy = this.st.energy;
  }

  create(): void {
    const d = this.st.def;
    audio.play(d.music ?? 'encounter');
    this.cameras.main.setBackgroundColor('#0e1226');
    const bg = this.add.graphics();
    for (let y = 0; y < H; y += 8) { bg.fillStyle(y % 16 === 0 ? 0x121834 : 0x0e1226, 1); bg.fillRect(0, y, W, 8); }
    bg.fillStyle(0x1c2444, 1); bg.fillRect(0, 96, W, 2);

    this.g = this.add.graphics();
    // opponent portrait frame (top right)
    this.oppPortrait = this.add.image(292, 22, portraitKey(this, d.cast, 'angry')).setOrigin(0, 0).setScale(3);
    this.heroPortrait = this.add.image(14, 100, portraitKey(this, 'erik', 'neutral')).setOrigin(0, 0).setScale(2);

    this.title = text(this, 12, 10, d.name.toUpperCase(), { color: COLORS.accent });
    this.concern = text(this, 12, 22, '', { color: COLORS.dim });
    this.concern.setText(wrap('Concern: ' + d.title, 44).join('\n')).setScale(0.75);
    this.resText = text(this, 12, 56, '', { color: COLORS.text });
    this.statusText = text(this, 12, 82, '', { color: COLORS.bad }).setScale(0.75);
    this.energyText = text(this, 88, 104, '', { color: COLORS.text });
    text(this, 88, 128, PERSONAL.heroNickname.toUpperCase(), { color: COLORS.accent });
    this.msg = text(this, 14, 158, '', {});
    this.arrow = text(this, W - 16, H - 14, 'v', { color: COLORS.accent }).setVisible(false);

    this.drawPanels();
    this.cameras.main.fadeIn(250, 0, 0, 0);
    this.say([...d.intro], () => this.showMenu());
    input.clear();
  }

  private drawPanels(): void {
    const g = this.g;
    g.clear();
    const s = this.st;
    // resolution meter
    meter(g, 12, 68, 200, 8, this.displayRes / s.def.target, 0x2ec27e);
    this.resText.setText(`RESOLUTION ${Math.round(this.displayRes)}/${s.def.target}`);
    const tags: string[] = [];
    if (s.resistTurns > 0) tags.push(`RESISTANT x${s.resistTurns}`);
    if (s.delayTurns > 0) tags.push(`SUBCOMMITTEE x${s.delayTurns}`);
    if (s.listened) tags.push('INSIGHT');
    this.statusText.setText(tags.join('   ')).setColor(tags.length && !s.listened ? COLORS.bad : COLORS.blue);
    // energy meter
    meter(g, 88, 116, 120, 8, this.displayEnergy / BALANCE.maxEnergy, 0x66aaff);
    this.energyText.setText(`ENERGY ${Math.round(this.displayEnergy)}/${BALANCE.maxEnergy}`);
    // portrait frames
    g.fillStyle(0xf4f4f0, 1); g.fillRect(288, 18, 104, 104);
    g.fillStyle(0x101018, 1); g.fillRect(291, 21, 98, 98);
    g.fillStyle(0xf4f4f0, 1); g.fillRect(10, 96, 72, 72);
    g.fillStyle(0x101018, 1); g.fillRect(13, 99, 66, 66);
    // message box
    box(g, 2, 150, W - 4, H - 152);
  }

  private say(lines: string[], after: () => void): void {
    this.phase = 'narrate';
    this.menuContainer?.destroy(); this.menuContainer = undefined;
    this.queue = lines.slice();
    this.afterQueue = after;
    this.nextLine();
  }
  private nextLine(): void {
    if (!this.queue.length) { const f = this.afterQueue; this.afterQueue = null; f?.(); return; }
    this.current = wrap(this.queue.shift()!, 46).join('\n');
    this.typed = 0; this.typeTimer = 0;
    this.msg.setText('');
    this.arrow.setVisible(false);
  }

  private showMenu(): void {
    if (this.st.over) { this.endEncounter(this.st.over); return; }
    this.phase = 'menu';
    this.msg.setText('');
    this.arrow.setVisible(false);
    this.renderMenu();
  }

  private renderMenu(): void {
    this.menuContainer?.destroy();
    const c = this.add.container(0, 0);
    const s = this.st;
    MENU_ITEMS.forEach((m, i) => {
      const col = i < 4 ? 0 : 1;
      const row = i % 4;
      const x = 14 + col * 148;
      const y = 158 + row * 18;
      const usable = m === 'retreat' ? { ok: true } : canUse(s, m);
      const name = m === 'retreat' ? 'Step Away' : MOVE_INFO[m].name;
      let color = COLORS.text;
      if (!usable.ok) color = '#606880';
      if (m !== 'retreat' && s.listened) {
        const e = effectivenessOf(s, m);
        if (e === 'super') color = COLORS.good; else if (e === 'good') color = '#c8f0a0'; else if (e === 'weak') color = '#c0a060'; else if (e === 'backfire') color = COLORS.bad;
      }
      if (i === this.cursor) color = COLORS.accent;
      c.add(text(this, x + 12, y, name, { color }));
      if (i === this.cursor) c.add(this.add.image(x, y, 'cursor').setOrigin(0, 0));
    });
    // description panel
    const sel = MENU_ITEMS[this.cursor];
    const dg = this.add.graphics();
    dg.fillStyle(0xf4f4f0, 1); dg.fillRect(292, 156, 1, 76);
    c.add(dg);
    let desc = '';
    if (sel === 'retreat') desc = 'Leave for now. No morale hit. Come back after a rest.';
    else {
      const u = canUse(s, sel);
      desc = MOVE_INFO[sel].desc + `  Cost: ${moveCost(sel)}`;
      if (sel === 'coffee') desc += ` (+12 back)`;
      if (!u.ok) desc = u.reason ?? 'Unavailable.';
      else if (s.listened) {
        const e = effectivenessOf(s, sel);
        const label = e === 'super' ? 'SUPER EFFECTIVE' : e === 'good' ? 'Effective' : e === 'weak' ? 'Not very effective' : e === 'backfire' ? 'WILL BACKFIRE' : 'Normal';
        desc += `\n${label}`;
      }
    }
    const t = text(this, 297, 158, wrap(desc, 16).slice(0, 6).join('\n'), { color: COLORS.dim });
    t.setScale(0.75);
    c.add(t);
    const hint = hintFor(s);
    if (hint && this.phase === 'menu') {
      const ht = text(this, 297, 214, wrap(hint, 16).slice(0, 2).join('\n'), { color: COLORS.good }).setScale(0.75);
      c.add(ht);
    }
    this.menuContainer = c;
  }

  private doMove(m: MoveId | 'retreat'): void {
    if (m === 'retreat') {
      audio.sfx('cancel');
      this.say(['You step away. "Let me pray on it," you say, which is true.', 'Come back when you have rested.'], () => this.finishOut('retreat'));
      return;
    }
    const u = canUse(this.st, m);
    if (!u.ok) { audio.sfx('cancel'); this.msg.setText(''); this.flashText(u.reason ?? 'Nope.'); return; }
    audio.sfx('confirm');
    const before = this.st.resolution;
    const res: TurnResult = playerMove(this.st, m);
    this.heroMood = this.st.energy < 30 ? 'tired' : m === 'boundary' ? 'smug' : 'neutral';
    this.heroPortrait.setTexture(portraitKey(this, 'erik', this.heroMood));
    const playerLines = res.playerText.slice();
    if (res.effect === 'backfire') playerLines.push(`${PERSONAL.heroNickname}: "${fakeCurse()}" ${curseCorrection()}`);
    // sound for effect
    const sfxAfter = res.gain >= 30 ? 'super' : res.gain > 0 ? 'hit' : res.gain < 0 ? 'lose' : 'weak';
    this.say(playerLines, () => {
      audio.sfx(sfxAfter);
      if (res.gain >= 30) this.cameras.main.flash(120, 255, 255, 255);
      this.tweens.add({ targets: this, displayRes: this.st.resolution, duration: 400, onUpdate: () => this.drawPanels() });
      this.tweens.add({ targets: this, displayEnergy: this.st.energy, duration: 300, onUpdate: () => this.drawPanels() });
      const oppMood: Mood = this.st.resolution >= this.st.def.target ? 'happy' : this.st.resolution > this.st.def.target * 0.6 ? 'neutral' : this.st.resolution > before ? 'neutral' : 'angry';
      this.oppPortrait.setTexture(portraitKey(this, this.st.def.cast, oppMood));
      if (res.over === 'win') { this.endEncounter('win'); return; }
      this.time.delayedCall(300, () => {
        this.say(res.opponentText, () => {
          const om = res.opponentMove;
          if (om && ((om.energy ?? 0) < 0 || (om.resolution ?? 0) < 0 || om.morale)) { audio.sfx('thud'); this.cameras.main.shake(150, 0.004); }
          else audio.sfx('alert');
          this.tweens.add({ targets: this, displayRes: this.st.resolution, duration: 400, onUpdate: () => this.drawPanels() });
          this.tweens.add({ targets: this, displayEnergy: this.st.energy, duration: 300, onUpdate: () => this.drawPanels() });
          this.oppPortrait.setTexture(portraitKey(this, this.st.def.cast, 'smug'));
          if (res.over === 'lose') this.endEncounter('lose'); else this.time.delayedCall(250, () => this.showMenu());
        });
      });
    });
  }

  private flashText(t: string): void {
    const f = text(this, W / 2, 140, t, { color: COLORS.bad, align: 'center' }).setOrigin(0.5);
    this.tweens.add({ targets: f, alpha: 0, y: 130, duration: 1200, onComplete: () => f.destroy() });
  }

  private endEncounter(r: 'win' | 'lose'): void {
    this.phase = 'end';
    this.result = r;
    const d = this.st.def;
    if (r === 'win') {
      audio.sfx('win');
      this.heroPortrait.setTexture(portraitKey(this, 'erik', 'happy'));
      this.oppPortrait.setTexture(portraitKey(this, d.cast, 'happy'));
      this.say([...d.winText], () => this.finishOut('win'));
    } else {
      audio.sfx('fail');
      this.heroPortrait.setTexture(portraitKey(this, 'erik', 'tired'));
      this.say([...d.loseText, `${PERSONAL.heroNickname}: "${fakeCurse()}" ${curseCorrection()}`, `Congregation morale -${BALANCE.encounterLossMorale}. You need a nap and a snack.`], () => this.finishOut('lose'));
    }
  }

  private finishOut(kind: 'win' | 'lose' | 'retreat'): void {
    const g = session.game;
    const r: 'win' | 'lose' = kind === 'win' ? 'win' : 'lose';
    // commit energy + morale changes
    g.state.energy = Math.max(0, Math.min(BALANCE.maxEnergy, this.st.energy));
    if (this.st.moraleDelta) g.change('morale', this.st.moraleDelta);
    if (kind === 'lose') g.change('morale', -BALANCE.encounterLossMorale);
    if (kind === 'lose' && g.state.energy < 15) g.state.energy = 15; // never strand the player with nothing
    g.set('lastEncounter', kind);
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const cb = this.onDone;
      this.scene.stop();
      cb(r);
    });
  }

  // ---- test/debug hooks ----
  get debugPhase(): Phase { return this.phase; }
  get debugState(): EncounterState { return this.st; }
  /** Index into the move menu of the best available move (used by automated tests). */
  debugBestMove(): number {
    const s = this.st;
    if (!s.listened && canUse(s, 'listen').ok) return MENU_ITEMS.indexOf('listen');
    const rank: Record<string, number> = { super: 4, good: 3, normal: 2, weak: 1, backfire: 0 };
    let best: MoveId | null = null; let bestScore = -1;
    for (const m of MOVES) {
      if (m === 'listen' || m === 'sage') continue;
      if (!canUse(s, m).ok) continue;
      const sc = rank[effectivenessOf(s, m)] + (m === 'coffee' && s.energy < 30 ? 1.5 : 0);
      if (sc > bestScore) { bestScore = sc; best = m; }
    }
    return best ? MENU_ITEMS.indexOf(best) : MENU_ITEMS.indexOf('retreat');
  }
  debugChoose(idx: number): void { if (this.phase === 'menu') { this.cursor = idx; this.renderMenu(); this.doMove(MENU_ITEMS[idx]); } }

  update(time: number, delta: number): void {
    if (this.phase === 'narrate' || this.phase === 'end' || this.phase === 'intro') {
      if (this.current && this.typed < this.current.length) {
        this.typeTimer += delta;
        const speed = input.isDown('a') ? 6 : 18;
        while (this.typeTimer > speed && this.typed < this.current.length) { this.typeTimer -= speed; this.typed++; if (this.typed % 3 === 0) audio.sfx('blip'); }
        this.msg.setText(this.current.slice(0, this.typed));
        if (input.consume('a')) { this.typed = this.current.length; this.msg.setText(this.current); }
        if (this.typed >= this.current.length) this.arrow.setVisible(true);
      } else if (this.current) {
        this.arrow.setVisible(true).setY(H - 14 + (Math.floor(time / 300) % 2));
        if (input.consume('a') || input.consume('b')) { audio.sfx('confirm'); this.nextLine(); }
      }
    } else if (this.phase === 'menu') {
      if (input.consume('up')) { this.cursor = (this.cursor + 7) % 8; audio.sfx('move'); this.renderMenu(); }
      if (input.consume('down')) { this.cursor = (this.cursor + 1) % 8; audio.sfx('move'); this.renderMenu(); }
      if (input.consume('left') || input.consume('right')) { this.cursor = (this.cursor + 4) % 8; audio.sfx('move'); this.renderMenu(); }
      if (input.consume('a')) this.doMove(MENU_ITEMS[this.cursor]);
      if (input.consume('b')) { this.cursor = 7; this.renderMenu(); }
    }
  }
}
