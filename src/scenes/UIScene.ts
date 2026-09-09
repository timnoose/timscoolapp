import Phaser from 'phaser';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import { Game, newGameState, type ResourceChange, type ResourceKey } from '../engine/state';
import { box, text, wrap, money, COLORS, meter } from '../engine/ui';
import { portraitKey } from '../engine/textures';
import { castName } from '../data/cast';
import { DIALOGUE, TALK, template } from '../data/dialogue';
import { QUESTS, currentObjective, RESOURCE_HELP, ALLY_NOTES } from '../data/quests';
import { applyEffects, isBranch, isChoice, isEffects, isEncounter, isEnd, isFundCheck, isGoto, isLine, type ChoiceOption, type Step } from '../engine/script';
import type { WorldScene } from './WorldScene';
import type { Mood } from '../art/portraits';
import { BALANCE } from '../data/balance';

const CHARS_PER_LINE = 41;
const LINES_PER_PAGE = 3;
const BOX_Y = 176;
const METER_MARK = '@@METER@@';

type Pending = { restDay?: boolean; ending?: 'buy' | 'build'; warp?: { map: string; x: number; y: number; dir?: 'down' | 'up' | 'left' | 'right' } };

export class UIScene extends Phaser.Scene {
  // dialogue state
  private steps: Step[] = [];
  private idx = 0;
  private dialogueActive = false;
  private pages: string[][] = [];
  private page = 0;
  private typed = 0;
  private typeTimer = 0;
  private lineWho?: string;
  private lineMood: Mood = 'neutral';
  private onDialogueDone?: () => void;
  private pending: Pending = {};
  private waitingEncounter = false;

  // dialogue objects
  private dlgG!: Phaser.GameObjects.Graphics;
  private dlgText!: Phaser.GameObjects.Text;
  private dlgName!: Phaser.GameObjects.Text;
  private dlgPortrait!: Phaser.GameObjects.Image;
  private dlgArrow!: Phaser.GameObjects.Text;
  private dlgContainer!: Phaser.GameObjects.Container;

  // choices
  private choiceOptions: ChoiceOption[] = [];
  private choiceCursor = 0;
  private choiceContainer?: Phaser.GameObjects.Container;

  // HUD
  private hudG!: Phaser.GameObjects.Graphics;
  private hudTexts: Record<ResourceKey, Phaser.GameObjects.Text> = {} as Record<ResourceKey, Phaser.GameObjects.Text>;
  private hudDay!: Phaser.GameObjects.Text;
  private hudIcons: Record<ResourceKey, Phaser.GameObjects.Image> = {} as Record<ResourceKey, Phaser.GameObjects.Image>;
  private objectiveText!: Phaser.GameObjects.Text;
  private objectiveTimer = 0;
  private lastObjective = '';
  private unsub?: () => void;

  // menu
  private menuOpen = false;
  private menuTab = 0;
  private menuCursor = 0;
  private menuScroll = 0;
  private menuContainer?: Phaser.GameObjects.Container;
  private confirmNew = false;

  // toasts / banners
  private toastText!: Phaser.GameObjects.Text;
  private toastG!: Phaser.GameObjects.Graphics;
  private toastTimer = 0;
  private bannerQueue: { title: string; sub: string; sfx: string; color: string }[] = [];
  private bannerActive = false;
  private tipShown = false;

  constructor() { super('UI'); }

  get world(): WorldScene { return this.scene.get('World') as WorldScene; }
  get blocking(): boolean { return this.dialogueActive || this.menuOpen || this.waitingEncounter; }
  get inDialogue(): boolean { return this.dialogueActive; }
  get choiceCount(): number { return this.choiceOptions.length; }
  get menuIsOpen(): boolean { return this.menuOpen; }

  create(): void {
    this.dialogueActive = false; this.menuOpen = false; this.waitingEncounter = false;
    this.tipShown = false; this.lastObjective = '';
    // HUD
    this.hudG = this.add.graphics().setDepth(100);
    const keys: ResourceKey[] = ['fund', 'goodwill', 'morale', 'energy'];
    keys.forEach((k, i) => {
      const x = 6 + i * 62;
      this.hudIcons[k] = this.add.image(x, 5, `icon-${k}`).setOrigin(0, 0).setDepth(101);
      this.hudTexts[k] = text(this, x + 10, 5, '', { size: 8 }).setDepth(101);
    });
    this.hudDay = text(this, W - 6, 5, '', { size: 8, color: COLORS.accent }).setOrigin(1, 0).setDepth(101);
    this.objectiveText = text(this, 6, 18, '', { size: 8, color: COLORS.accent }).setDepth(101).setAlpha(0);
    this.drawHud();
    this.unsub = session.game.onChange((c) => this.onResourceChange(c));

    // dialogue box
    this.dlgContainer = this.add.container(0, 0).setDepth(200).setVisible(false);
    this.dlgG = this.add.graphics();
    this.dlgPortrait = this.add.image(10, BOX_Y + 10, portraitKey(this, 'erik', 'neutral')).setOrigin(0, 0);
    this.dlgText = text(this, 50, BOX_Y + 9, '', { wrap: 0 });
    this.dlgName = text(this, 52, BOX_Y - 9, '', { color: COLORS.accent });
    this.dlgArrow = text(this, W - 16, H - 14, 'v', { color: COLORS.accent });
    this.dlgContainer.add([this.dlgG, this.dlgPortrait, this.dlgText, this.dlgName, this.dlgArrow]);

    // toast
    this.toastG = this.add.graphics().setDepth(300).setVisible(false);
    this.toastText = text(this, W / 2, 46, '', { align: 'center' }).setOrigin(0.5).setDepth(301).setVisible(false);

    this.events.on('shutdown', () => { this.unsub?.(); });
    this.time.delayedCall(600, () => this.showTip());
  }

  private showTip(): void {
    if (this.tipShown) return;
    this.tipShown = true;
    if (!session.game.has('tipShown')) {
      session.game.set('tipShown');
      this.toast(input.isTouch ? 'D-pad: move  A: talk/confirm  B: back  MENU: journal' : 'Arrows/WASD move - Space/Enter talk - Esc/Tab menu', 5000);
    }
  }

  onMapChange(): void { /* hook for future per-map UI */ }

  // ---------------- HUD ----------------
  private drawHud(): void {
    const s = session.game.state;
    this.hudG.clear();
    this.hudG.fillStyle(0x000000, 0.55);
    this.hudG.fillRect(0, 0, W, 16);
    this.hudTexts.fund.setText(money(s.fund));
    this.hudTexts.goodwill.setText(`${s.goodwill}`);
    this.hudTexts.morale.setText(`${s.morale}`);
    this.hudTexts.energy.setText(`${s.energy}`);
    this.hudTexts.energy.setColor(s.energy < 25 ? COLORS.bad : COLORS.text);
    this.hudDay.setText(`DAY ${s.day}`);
  }

  private onResourceChange(c: ResourceChange): void {
    this.drawHud();
    const idx: Record<ResourceKey, number> = { fund: 0, goodwill: 1, morale: 2, energy: 3 };
    const x = 6 + idx[c.key] * 62;
    const label = c.key === 'fund' ? (c.delta > 0 ? '+' : '-') + money(Math.abs(c.delta)) : (c.delta > 0 ? '+' : '') + c.delta;
    const t = text(this, x, 18, label, { color: c.delta > 0 ? COLORS.good : COLORS.bad }).setDepth(150);
    this.tweens.add({ targets: t, y: 4, alpha: 0, duration: 1400, delay: 400, ease: 'Sine.out', onComplete: () => t.destroy() });
    if (c.key === 'fund' && c.delta > 0) audio.sfx('coin');
    else if (c.delta < 0 && c.key !== 'energy') audio.sfx('weak');
    this.tweens.add({ targets: this.hudIcons[c.key], scale: 1.6, duration: 120, yoyo: true });
  }

  toast(msg: string, ms = 2600): void {
    this.toastText.setText(msg).setVisible(true);
    this.toastText.setScale(msg.length > 46 ? 0.75 : 1);
    const w = Math.min(W - 8, this.toastText.displayWidth + 16);
    this.toastG.clear();
    box(this.toastG, Math.round((W - w) / 2), 36, w, 20);
    this.toastG.setVisible(true);
    this.toastTimer = this.time.now + ms;
  }

  banner(title: string, sub: string, sfx = 'quest', color = COLORS.accent): void {
    this.bannerQueue.push({ title, sub, sfx, color });
    this.pumpBanner();
  }
  private pumpBanner(): void {
    if (this.bannerActive || !this.bannerQueue.length) return;
    const b = this.bannerQueue.shift()!;
    this.bannerActive = true;
    audio.sfx(b.sfx);
    const c = this.add.container(0, -40).setDepth(400);
    const g = this.add.graphics();
    box(g, 40, 0, W - 80, 34);
    c.add(g);
    c.add(text(this, W / 2, 9, b.title, { color: b.color, align: 'center' }).setOrigin(0.5, 0));
    const st = text(this, W / 2, 21, b.sub, { align: 'center' }).setOrigin(0.5, 0);
    if (st.width > W - 96) st.setScale((W - 96) / st.width);
    c.add(st);
    this.tweens.add({ targets: c, y: 44, duration: 300, ease: 'Back.out' });
    this.time.delayedCall(2200, () => {
      this.tweens.add({ targets: c, y: -40, duration: 250, onComplete: () => { c.destroy(); this.bannerActive = false; this.pumpBanner(); } });
    });
  }

  private updateObjective(): void {
    const obj = currentObjective(session.game);
    if (obj !== this.lastObjective) {
      this.lastObjective = obj;
      this.objectiveText.setText('> ' + obj).setAlpha(1);
      if (this.objectiveText.width > W - 12) this.objectiveText.setScale((W - 12) / this.objectiveText.width); else this.objectiveText.setScale(1);
      this.objectiveTimer = this.time.now + 5000;
    }
  }

  // ---------------- Dialogue ----------------
  startDialogueFor(talkKey: string, onDone?: () => void): void {
    const resolver = TALK[talkKey];
    const id = resolver ? resolver(session.game) : talkKey;
    this.startDialogue(id, onDone);
  }

  startDialogue(id: string, onDone?: () => void): void {
    const steps = DIALOGUE[id];
    if (!steps) { console.warn('Missing dialogue', id); onDone?.(); return; }
    this.steps = steps;
    this.idx = 0;
    this.dialogueActive = true;
    this.pending = {};
    this.onDialogueDone = onDone;
    input.clear();
    this.next();
  }

  private next(): void {
    if (this.idx >= this.steps.length) { this.finish(); return; }
    const step = this.steps[this.idx++];
    if (isLine(step)) { this.showLine(step.who, step.mood ?? 'neutral', template(step.text, session.game)); return; }
    if (isChoice(step)) { this.showChoices(step.choice); return; }
    if (isEffects(step)) { this.runEffects(step.effects); this.next(); return; }
    if (isGoto(step)) { this.jump(step.goto); return; }
    if (isBranch(step)) {
      const target = step.if(session.game) ? step.then : step.else;
      if (target) this.jump(target); else this.next();
      return;
    }
    if (isFundCheck(step)) { this.jump(session.game.state.fund >= step.fundCheck ? step.then : step.else); return; }
    if (isEncounter(step)) { this.launchEncounter(step.encounter, step.win, step.lose); return; }
    if (isEnd(step)) { this.finish(); return; }
    this.next();
  }

  private runEffects(effects: Parameters<typeof applyEffects>[1]): void {
    const r = applyEffects(session.game, effects);
    r.sfx?.forEach((s) => audio.sfx(s));
    r.questStarted?.forEach((q) => this.banner('NEW QUEST', QUESTS[q]?.title ?? q));
    r.questDone?.forEach((q) => this.banner('QUEST COMPLETE', QUESTS[q]?.title ?? q, 'win', COLORS.good));
    r.allyAdded?.forEach((a) => this.banner('NEW ALLY', castName(a), 'heal', COLORS.blue));
    if (r.restDay) this.pending.restDay = true;
    if (r.ending) this.pending.ending = r.ending;
    if (r.warp) this.pending.warp = r.warp;
  }

  private jump(id: string): void {
    const steps = DIALOGUE[id];
    if (!steps) { console.warn('Missing dialogue', id); this.finish(); return; }
    this.steps = steps; this.idx = 0; this.next();
  }

  private finish(): void {
    this.dialogueActive = false;
    this.dlgContainer.setVisible(false);
    this.closeChoices();
    const p = this.pending; this.pending = {};
    const done = this.onDialogueDone; this.onDialogueDone = undefined;
    session.game.save();
    this.world.refreshNpcs();
    this.updateObjective();
    if (p.ending) { this.world.startEnding(p.ending); return; }
    if (p.warp) { this.world.warp(p.warp.map, p.warp.x, p.warp.y, p.warp.dir ?? 'down'); return; }
    if (p.restDay) { this.world.rest(done); return; }
    done?.();
  }

  private showLine(who: string | undefined, mood: Mood, txt: string): void {
    this.lineWho = who; this.lineMood = mood;
    const lines = wrap(txt, who ? CHARS_PER_LINE : CHARS_PER_LINE + 4);
    this.pages = [];
    for (let i = 0; i < lines.length; i += LINES_PER_PAGE) this.pages.push(lines.slice(i, i + LINES_PER_PAGE));
    this.page = 0;
    this.renderPage();
  }

  private renderPage(): void {
    this.dlgContainer.setVisible(true);
    this.dlgG.clear();
    box(this.dlgG, 2, BOX_Y, W - 4, H - BOX_Y - 2);
    const who = this.lineWho;
    if (who) {
      this.dlgPortrait.setTexture(portraitKey(this, who, this.lineMood)).setVisible(true);
      this.dlgG.fillStyle(0xf4f4f0, 1); this.dlgG.fillRect(8, BOX_Y + 8, 36, 36);
      this.dlgG.fillStyle(0x101018, 1); this.dlgG.fillRect(10, BOX_Y + 10, 32, 32);
      const name = castName(who);
      this.dlgName.setText(name).setVisible(true);
      const nw = this.dlgName.width + 10;
      box(this.dlgG, 48, BOX_Y - 12, nw, 16);
      this.dlgName.setPosition(53, BOX_Y - 8);
      this.dlgText.setX(50);
    } else {
      this.dlgPortrait.setVisible(false);
      this.dlgName.setVisible(false);
      this.dlgText.setX(12);
    }
    this.typed = 0;
    this.typeTimer = 0;
    this.dlgArrow.setVisible(false);
    this.dlgText.setText('');
  }

  private get pageText(): string { return this.pages[this.page].join('\n'); }

  private launchEncounter(id: string, win: string, lose: string): void {
    this.waitingEncounter = true;
    this.dlgContainer.setVisible(false);
    this.closeChoices();
    this.pages = []; // nothing to advance while the encounter runs
    this.scene.launch('Encounter', {
      id,
      onDone: (result: 'win' | 'lose') => {
        this.scene.wake('World');
        this.scene.wake('UI');
        input.clear();
        this.drawHud();
        this.pages = [];
        this.jump(result === 'win' ? win : lose);
        this.waitingEncounter = false;
      },
    });
    this.scene.sleep('World');
    this.scene.sleep('UI');
  }

  // ---------------- Choices ----------------
  private showChoices(opts: ChoiceOption[]): void {
    this.choiceOptions = opts.filter((o) => !o.require || o.require(session.game));
    this.choiceCursor = 0;
    this.renderChoices();
    audio.sfx('blip');
  }
  private renderChoices(): void {
    this.choiceContainer?.destroy();
    const c = this.add.container(0, 0).setDepth(210);
    const labels = this.choiceOptions.map((o) => template(o.label, session.game));
    const maxLen = Math.max(...labels.map((l) => l.length));
    const w = Math.min(W - 8, maxLen * 8 + 32);
    const h = labels.length * 12 + 14;
    const x = W - 4 - w;
    const y = BOX_Y - 4 - h;
    const g = this.add.graphics();
    box(g, x, y, w, h);
    c.add(g);
    labels.forEach((l, i) => {
      const disabled = this.choiceOptions[i].disabled?.(session.game);
      const t = text(this, x + 18, y + 7 + i * 12, l, { color: disabled ? '#707890' : i === this.choiceCursor ? COLORS.accent : COLORS.text });
      c.add(t);
      if (i === this.choiceCursor) c.add(this.add.image(x + 8, y + 7 + i * 12, 'cursor').setOrigin(0, 0));
    });
    this.choiceContainer = c;
  }
  private closeChoices(): void { this.choiceContainer?.destroy(); this.choiceContainer = undefined; this.choiceOptions = []; }

  private pickChoice(): void {
    const opt = this.choiceOptions[this.choiceCursor];
    if (!opt) return;
    if (opt.disabled?.(session.game)) { audio.sfx('cancel'); this.toast(opt.disabledText ?? "Can't do that yet."); return; }
    audio.sfx('confirm');
    this.closeChoices();
    if (opt.effects) this.runEffects(opt.effects);
    if (opt.goto) this.jump(opt.goto); else this.next();
  }

  // ---------------- Menu ----------------
  openMenu(): void {
    if (this.menuOpen) return;
    this.menuOpen = true;
    this.menuTab = 0; this.menuCursor = 0; this.menuScroll = 0; this.confirmNew = false;
    audio.sfx('confirm');
    this.renderMenu();
  }
  closeMenu(): void {
    this.menuOpen = false;
    this.menuContainer?.destroy();
    this.menuContainer = undefined;
    audio.sfx('cancel');
  }
  private renderMenu(): void {
    this.menuContainer?.destroy();
    const c = this.add.container(0, 0).setDepth(500);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.6); g.fillRect(0, 0, W, H);
    box(g, 4, 4, W - 8, H - 8);
    c.add(g);
    const tabs = ['JOURNAL', 'RESOURCES', 'ALLIES', 'SYSTEM'];
    tabs.forEach((t, i) => {
      const tx = 14 + i * 96;
      const active = i === this.menuTab;
      if (active) { g.fillStyle(0x5a6a9a, 1); g.fillRect(tx - 4, 10, 92, 14); }
      c.add(text(this, tx, 13, t, { color: active ? COLORS.accent : COLORS.dim }));
    });
    g.fillStyle(0xf4f4f0, 1); g.fillRect(8, 26, W - 16, 1);
    const gm = session.game;
    const s = gm.state;
    const lines: { t: string; color?: string; scale?: number }[] = [];
    if (this.menuTab === 0) {
      wrap('NOW: ' + currentObjective(gm), 62).forEach((l) => lines.push({ t: l, color: COLORS.accent, scale: 0.75 }));
      lines.push({ t: '' });
      const order = Object.values(QUESTS).sort((a, b) => a.order - b.order);
      for (const q of order) {
        const qs = gm.quest(q.id);
        if (qs.status === 'inactive' && !q.showWhenInactive) continue;
        const mark = qs.status === 'done' ? '[x]' : qs.status === 'active' ? '[ ]' : '[?]';
        lines.push({ t: `${mark} ${q.title}`, color: qs.status === 'done' ? COLORS.good : qs.status === 'active' ? COLORS.text : COLORS.dim });
        const detail = qs.status === 'done' ? (qs.outcome ?? 'Done.') : qs.status === 'active' ? q.objective(gm) : '???';
        wrap('    ' + detail, 62).forEach((l) => lines.push({ t: l, color: COLORS.dim, scale: 0.75 }));
      }
      if (!order.some((q) => gm.quest(q.id).status !== 'inactive')) lines.push({ t: 'No quests yet. Talk to people!', color: COLORS.dim });
    } else if (this.menuTab === 1) {
      const rows: [string, string, string, number, number][] = [
        ['BUILDING FUND', money(s.fund), RESOURCE_HELP.fund, s.fund / BALANCE.buyCost, 0x2ec27e],
        ['COMMUNITY GOODWILL', `${s.goodwill}/100`, RESOURCE_HELP.goodwill, s.goodwill / 100, 0xff5f5f],
        ['CONGREGATION MORALE', `${s.morale}/100`, RESOURCE_HELP.morale, s.morale / 100, 0xf5d547],
        ['PASTOR ENERGY', `${s.energy}/100`, RESOURCE_HELP.energy, s.energy / 100, 0x66aaff],
      ];
      rows.forEach(([name, val, help, frac, color]) => {
        lines.push({ t: `${name}  ${val}`, color: COLORS.accent });
        lines.push({ t: `${METER_MARK}${frac}|${color}` });
        wrap(help, 62).forEach((l) => lines.push({ t: l, color: COLORS.dim, scale: 0.75 }));
        lines.push({ t: '' });
      });
      lines.push({ t: `Goal: BUY needs ${money(BALANCE.buyCost)} + morale ${BALANCE.buyMoraleNeeded}.`, scale: 0.75 });
      lines.push({ t: `      BUILD needs ${money(BALANCE.buildCost)} + goodwill ${BALANCE.buildGoodwillNeeded} + a permit.`, scale: 0.75 });
      lines.push({ t: `Day ${s.day}. Sunday services (pulpit) raise money.`, scale: 0.75 });
    } else if (this.menuTab === 2) {
      if (!s.allies.length) lines.push({ t: 'No allies yet. Help people and they help back.', color: COLORS.dim });
      for (const a of s.allies) {
        lines.push({ t: `* ${castName(a)}`, color: COLORS.blue });
        wrap('    ' + (ALLY_NOTES[a] ?? ''), 62).forEach((l) => lines.push({ t: l, color: COLORS.dim, scale: 0.75 }));
      }
    } else {
      const items = ['SAVE GAME', `SOUND: ${audio.muted ? 'OFF' : 'ON'}`, 'NEW GAME', 'CLOSE MENU'];
      items.forEach((it, i) => lines.push({ t: (i === this.menuCursor ? '> ' : '  ') + it, color: i === this.menuCursor ? COLORS.accent : COLORS.text }));
      lines.push({ t: '' });
      lines.push({ t: `Playtime ${Math.floor(s.playtimeMs / 60000)} min - Day ${s.day} - Save v${s.version}`, color: COLORS.dim, scale: 0.75 });
      lines.push({ t: 'Progress auto-saves at doors and after talks.', color: COLORS.dim, scale: 0.75 });
      if (this.confirmNew) {
        lines.push({ t: '' });
        lines.push({ t: 'Erase your save and start over? A = yes, B = no', color: COLORS.bad });
      }
    }
    // render lines with scroll
    const visibleH = H - 56;
    let y = 32;
    const heights = lines.map((l) => (l.scale ? 9 : 12));
    const total = heights.reduce((a, b) => a + b, 0);
    const maxScroll = Math.max(0, total - visibleH);
    this.menuScroll = Math.max(0, Math.min(this.menuScroll, maxScroll));
    y -= this.menuScroll;
    lines.forEach((l, i) => {
      if (y >= 28 && y < H - 22) {
        if (l.t.startsWith(METER_MARK)) {
          const [f, col] = l.t.slice(METER_MARK.length).split('|');
          meter(g, 14, y + 2, 200, 5, parseFloat(f), parseInt(col, 10));
        } else {
          const t = text(this, 12, y, l.t, { color: l.color ?? COLORS.text });
          if (l.scale) t.setScale(l.scale);
          c.add(t);
        }
      }
      y += heights[i];
    });
    c.add(text(this, W / 2, H - 12, this.menuTab === 3 ? 'UP/DOWN select  A confirm  B close' : 'LEFT/RIGHT tabs  UP/DOWN scroll  B close', { color: COLORS.dim, align: 'center' }).setOrigin(0.5, 0).setScale(0.75));
    this.menuContainer = c;
  }

  private menuInput(): void {
    if (input.consume('b') || (this.menuTab !== 3 && input.consume('menu'))) {
      if (this.confirmNew) { this.confirmNew = false; this.renderMenu(); return; }
      this.closeMenu(); return;
    }
    if (input.consume('left')) { this.menuTab = (this.menuTab + 3) % 4; this.menuCursor = 0; this.menuScroll = 0; this.confirmNew = false; audio.sfx('move'); this.renderMenu(); }
    if (input.consume('right')) { this.menuTab = (this.menuTab + 1) % 4; this.menuCursor = 0; this.menuScroll = 0; this.confirmNew = false; audio.sfx('move'); this.renderMenu(); }
    if (this.menuTab === 3) {
      if (input.consume('up')) { this.menuCursor = (this.menuCursor + 3) % 4; audio.sfx('move'); this.renderMenu(); }
      if (input.consume('down')) { this.menuCursor = (this.menuCursor + 1) % 4; audio.sfx('move'); this.renderMenu(); }
      if (input.consume('a')) {
        if (this.confirmNew) {
          Game.clearSave();
          session.game = new Game(newGameState());
          session.game.state.mute = audio.muted;
          this.closeMenu();
          this.scene.stop('World');
          this.scene.stop('UI');
          this.scene.start('Title');
          return;
        }
        if (this.menuCursor === 0) { session.game.save(); audio.sfx('save'); this.toast('Game saved.'); }
        else if (this.menuCursor === 1) { audio.setMute(!audio.muted); session.game.state.mute = audio.muted; audio.sfx('confirm'); this.renderMenu(); }
        else if (this.menuCursor === 2) { this.confirmNew = true; audio.sfx('alert'); this.renderMenu(); }
        else this.closeMenu();
      }
    } else {
      if (input.consume('up') || input.repeat('up')) { this.menuScroll -= 12; this.renderMenu(); }
      if (input.consume('down') || input.repeat('down')) { this.menuScroll += 12; this.renderMenu(); }
    }
  }

  // ---------------- Update ----------------
  update(time: number, delta: number): void {
    if (this.toastTimer && time > this.toastTimer) { this.toastTimer = 0; this.toastG.setVisible(false); this.toastText.setVisible(false); }
    if (this.objectiveTimer && time > this.objectiveTimer) { this.objectiveTimer = 0; this.tweens.add({ targets: this.objectiveText, alpha: 0, duration: 400 }); }
    if (!this.dialogueActive && !this.menuOpen) this.updateObjective();

    if (this.menuOpen) { this.menuInput(); return; }

    if (this.dialogueActive && !this.waitingEncounter) {
      if (this.choiceOptions.length) {
        if (input.consume('up')) { this.choiceCursor = (this.choiceCursor + this.choiceOptions.length - 1) % this.choiceOptions.length; audio.sfx('move'); this.renderChoices(); }
        if (input.consume('down')) { this.choiceCursor = (this.choiceCursor + 1) % this.choiceOptions.length; audio.sfx('move'); this.renderChoices(); }
        if (input.consume('a')) this.pickChoice();
        input.consume('b');
      } else if (this.pages.length) {
        const full = this.pageText;
        if (this.typed < full.length) {
          this.typeTimer += delta;
          const speed = input.isDown('a') ? 8 : 22; // ms per char
          while (this.typeTimer > speed && this.typed < full.length) {
            this.typeTimer -= speed;
            this.typed++;
            if (this.typed % 3 === 0) audio.sfx('blip');
          }
          this.dlgText.setText(full.slice(0, this.typed));
          if (input.consume('a')) { this.typed = full.length; this.dlgText.setText(full); }
          if (this.typed >= full.length) this.dlgArrow.setVisible(true);
        } else {
          this.dlgArrow.setVisible(true);
          this.dlgArrow.setY(H - 14 + (Math.floor(time / 300) % 2));
          if (input.consume('a') || input.consume('b')) {
            audio.sfx('confirm');
            if (this.page < this.pages.length - 1) { this.page++; this.renderPage(); }
            else this.next();
          }
        }
      }
    }
  }
}
