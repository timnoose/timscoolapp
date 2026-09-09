import Phaser from 'phaser';
import { MAPS } from '../data/maps';
import { CAST } from '../data/cast';
import { TILE, TILE_INDEX, TILE_SOLID, CROWD_COUNT } from '../engine/textures';
import { input } from '../engine/input';
import { audio } from '../engine/audio';
import { session, W, H } from '../engine/session';
import type { Dir } from '../engine/state';
import type { MapDef, NpcPlacement } from '../engine/mapdef';
import type { UIScene } from './UIScene';
import { AUTO_DIALOGUE, NPC_VISIBLE, MAP_OVERRIDES, pickRandomEvent } from '../data/dialogue';
import { BALANCE } from '../data/balance';
import { TILES } from '../art/tiles';
import { fakeCurse } from '../data/dialogue';
import { questTarget, MAP_SHORT } from '../data/quests';
import { nextDoor } from '../engine/route';

const COUNTER_TILES = new Set(['cafeCounter', 'espresso', 'pastryCase', 'cityCounter', 'counterL', 'counterCoffee', 'counterR', 'grantDesk', 'desk', 'soundDesk', 'laptopTable']);
const DIR_FRAME: Record<Dir, number> = { down: 0, up: 3, left: 6, right: 9 };
const DIR_VEC: Record<Dir, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const MOVE_MS = 150;

interface Car { spr: Phaser.GameObjects.Image; axis: 'h' | 'v'; dir: 1 | -1; v: number; stopped: number; honked: boolean }
interface Bird { spr: Phaser.GameObjects.Image; vx: number; vy: number; phase: number }

interface NpcSprite {
  placement: NpcPlacement;
  sprite: Phaser.GameObjects.Sprite;
  x: number; y: number;
  dir: Dir;
  moving: boolean;
  nextWander: number;
  homeX: number; homeY: number;
}

export class WorldScene extends Phaser.Scene {
  map!: MapDef;
  private tilemap?: Phaser.Tilemaps.Tilemap;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];
  private solid: boolean[][] = [];
  player!: Phaser.GameObjects.Sprite;
  px = 0; py = 0;
  dir: Dir = 'down';
  private moving = false;
  private npcs: NpcSprite[] = [];
  private bumpAt = 0;
  private bumps = 0;
  private crowd: Phaser.GameObjects.Sprite[] = [];
  private inService = false;
  private transitioning = false;
  private ready = false;
  private lastPlaytime = 0;
  private mapLabel?: Phaser.GameObjects.Text;
  // guidance + living world
  private marker?: Phaser.GameObjects.Image;
  private markerLabel?: Phaser.GameObjects.Text;
  private markerBg?: Phaser.GameObjects.Graphics;
  private cars: Car[] = [];
  private nextCar = 0;
  private birds: Bird[] = [];
  private nextBirds = 0;
  private rainFx?: Phaser.GameObjects.Particles.ParticleEmitter;
  private rainTint?: Phaser.GameObjects.Graphics;
  private stepToggle = false;

  constructor() { super('World'); }

  get ui(): UIScene { return this.scene.get('UI') as UIScene; }
  get busy(): boolean { const ui = this.ui; return this.transitioning || !this.ready || (ui && ui.blocking); }
  get isTransitioning(): boolean { return this.transitioning || !this.ready; }

  create(): void {
    const s = session.game.state;
    this.cameras.main.setRoundPixels(true);
    this.loadMap(s.map, s.x, s.y, s.dir, true);
    this.lastPlaytime = this.time.now;
    this.events.on('shutdown', () => this.clearMap());
    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.time.delayedCall(450, () => { this.ready = true; this.onMapEntered(); });
  }

  // ---------------- Map loading ----------------
  private clearMap(): void {
    this.layers.forEach((l) => l.destroy());
    this.layers = [];
    this.tilemap?.destroy();
    this.tilemap = undefined;
    this.npcs.forEach((n) => { this.tweens.killTweensOf(n.sprite); n.sprite.destroy(); });
    this.npcs = [];
    this.crowd.forEach((c) => { this.tweens.killTweensOf(c); c.destroy(); });
    this.crowd = [];
    this.inService = false;
    if (this.player) { this.tweens.killTweensOf(this.player); this.player.destroy(); }
    this.mapLabel?.destroy();
    this.marker?.destroy(); this.marker = undefined;
    this.markerLabel?.destroy(); this.markerLabel = undefined;
    this.markerBg?.destroy(); this.markerBg = undefined;
    this.cars.forEach((c) => c.spr.destroy()); this.cars = [];
    this.birds.forEach((b) => b.spr.destroy()); this.birds = [];
    this.rainFx?.destroy(); this.rainFx = undefined;
    this.rainTint?.destroy(); this.rainTint = undefined;
    audio.rain(false);
  }

  loadMap(mapId: string, x: number, y: number, dir: Dir, initial = false): void {
    this.clearMap();
    const def = MAPS[mapId] ?? MAPS.town;
    this.map = def;
    const st = session.game.state;
    st.map = def.id; st.x = x; st.y = y; st.dir = dir;

    // story-driven tile changes (e.g. the memorial bench moving back)
    const ground2 = def.ground.map((r) => r.slice());
    const objects2 = def.objects.map((r) => r.slice());
    for (const [ox, oy, layer, tile] of MAP_OVERRIDES(session.game, def.id)) {
      if (layer === 'g') ground2[oy][ox] = tile; else objects2[oy][ox] = tile;
    }
    this.map = { ...def, ground: ground2, objects: objects2 };
    const tm = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: def.w, height: def.h });
    const tileset = tm.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0, 1)!;
    const ground = tm.createBlankLayer('ground', tileset)!;
    const objects = tm.createBlankLayer('objects', tileset)!;
    this.solid = Array.from({ length: def.h }, () => Array(def.w).fill(false));
    for (let j = 0; j < def.h; j++) {
      for (let i = 0; i < def.w; i++) {
        const gName = ground2[j][i] ?? def.fill;
        const gi = TILE_INDEX[gName];
        ground.putTileAt(gi + 1, i, j);
        let solid = TILE_SOLID[gi];
        const oName = objects2[j][i];
        if (oName) {
          const oi = TILE_INDEX[oName];
          objects.putTileAt(oi + 1, i, j);
          solid = solid || TILE_SOLID[oi];
        }
        this.solid[j][i] = solid;
      }
    }
    ground.setDepth(0);
    objects.setDepth(1);
    this.tilemap = tm;
    this.layers = [ground, objects];

    // player
    this.px = x; this.py = y; this.dir = dir;
    this.player = this.add.sprite(x * TILE + 8, y * TILE + 16, 'char-erik', DIR_FRAME[dir]).setOrigin(0.5, 1);
    this.player.setDepth(10 + y);
    this.moving = false;

    // NPCs
    for (const p of def.npcs) {
      if (!this.npcVisible(p)) continue;
      const spr = this.add.sprite(p.x * TILE + 8, p.y * TILE + 16, `char-${p.id}`, DIR_FRAME[p.dir ?? 'down']).setOrigin(0.5, 1);
      spr.setDepth(10 + p.y);
      this.npcs.push({ placement: p, sprite: spr, x: p.x, y: p.y, dir: p.dir ?? 'down', moving: false, nextWander: this.time.now + 1000 + Math.random() * 2000, homeX: p.x, homeY: p.y });
    }

    // camera
    const cam = this.cameras.main;
    const mw = def.w * TILE, mh = def.h * TILE;
    cam.setBounds(0, 0, Math.max(mw, W), Math.max(mh, H));
    if (mw < W || mh < H) {
      // center small maps by offsetting the camera scroll
      cam.setBounds(Math.min(0, (mw - W) / 2), Math.min(0, (mh - H) / 2), Math.max(mw, W), Math.max(mh, H));
    }
    cam.startFollow(this.player, true, 1, 1);
    cam.setRoundPixels(true);
    this.cameras.main.setBackgroundColor(def.indoor ? '#101018' : '#3c5a30');

    audio.play(def.music);
    if (!initial) this.ui?.onMapChange();
    this.showMapLabel(def.name);

    // quest marker + ambient life
    this.marker = this.add.image(0, 0, 'marker').setDepth(900).setVisible(false);
    this.markerLabel = this.add.text(0, 0, '', { fontFamily: 'PressStart', fontSize: '8px', color: '#ffd27f', resolution: 1 }).setOrigin(0.5, 1).setScale(0.75).setDepth(901).setVisible(false);
    this.markerLabel.setShadow(1, 1, '#000', 0, false, true);
    this.markerBg = this.add.graphics().setDepth(900);
    this.setupAmbient();
  }

  private showMapLabel(name: string): void {
    this.mapLabel?.destroy();
    const t = this.add.text(0, 0, name, { fontFamily: 'PressStart', fontSize: '8px', color: '#ffffff', resolution: 1 }).setScrollFactor(0).setDepth(1000).setAlpha(0);
    t.setPosition(W - 6 - t.width, H - 14);
    t.setShadow(1, 1, '#000', 0, false, true);
    this.mapLabel = t;
    this.tweens.add({ targets: t, alpha: 1, duration: 300, yoyo: true, hold: 1800 });
  }

  npcVisible(p: NpcPlacement): boolean {
    const g = session.game;
    if (p.when) {
      const neg = p.when.startsWith('!');
      const flag = neg ? p.when.slice(1) : p.when;
      if (neg ? g.has(flag) : !g.has(flag)) return false;
    }
    return NPC_VISIBLE(g, p.id, this.map.id);
  }

  /** Re-evaluate NPC presence after story changes. */
  refreshNpcs(): void {
    const def = this.map;
    // remove hidden
    this.npcs = this.npcs.filter((n) => {
      if (this.npcVisible(n.placement)) return true;
      n.sprite.destroy();
      return false;
    });
    // add newly visible
    for (const p of def.npcs) {
      if (!this.npcVisible(p)) continue;
      if (this.npcs.some((n) => n.placement === p)) continue;
      if (p.x === this.px && p.y === this.py) continue;
      const spr = this.add.sprite(p.x * TILE + 8, p.y * TILE + 16, `char-${p.id}`, DIR_FRAME[p.dir ?? 'down']).setOrigin(0.5, 1);
      spr.setDepth(10 + p.y);
      this.npcs.push({ placement: p, sprite: spr, x: p.x, y: p.y, dir: p.dir ?? 'down', moving: false, nextWander: this.time.now + 1500, homeX: p.x, homeY: p.y });
    }
  }

  private onMapEntered(): void {
    this.refreshNpcs();
    const auto = AUTO_DIALOGUE(session.game, this.map.id);
    if (auto) this.ui.startDialogue(auto);
  }

  // ---------------- Movement ----------------
  private blocked(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.map.w || y >= this.map.h) return true;
    if (this.solid[y][x]) return true;
    if (this.npcs.some((n) => (n.x === x && n.y === y))) return true;
    return false;
  }

  update(time: number, delta: number): void {
    if (session.started) session.game.state.playtimeMs += delta;
    if (this.ready && !this.transitioning) { this.updateMarker(time); this.updateCars(time, delta); this.updateBirds(time, delta); }
    if (this.busy) { this.player.anims.stop(); this.player.setFrame(DIR_FRAME[this.dir]); return; }
    this.updateNpcs(time);
    if (this.moving) return;

    if (input.consume('a')) { this.interact(); return; }
    if (input.consume('menu') || input.consume('b')) { this.ui.openMenu(); return; }

    let want: Dir | null = null;
    if (input.isDown('up')) want = 'up';
    else if (input.isDown('down')) want = 'down';
    else if (input.isDown('left')) want = 'left';
    else if (input.isDown('right')) want = 'right';
    if (!want) { this.player.anims.stop(); this.player.setFrame(DIR_FRAME[this.dir]); return; }

    this.dir = want;
    const [dx, dy] = DIR_VEC[want];
    const nx = this.px + dx, ny = this.py + dy;
    if (this.blocked(nx, ny)) {
      this.player.anims.stop();
      this.player.setFrame(DIR_FRAME[this.dir]);
      if (time - this.bumpAt > 400) {
        audio.sfx('bump');
        this.bumpAt = time;
        this.bumps++;
        session.game.stat('bumps');
        if (this.bumps % 7 === 0) { this.mutter(fakeCurse()); session.game.stat('curses'); }
      }
      return;
    }
    this.moving = true;
    this.px = nx; this.py = ny;
    this.stepToggle = !this.stepToggle;
    if (this.stepToggle) audio.sfx(this.map.indoor ? 'stepIn' : 'step');
    this.player.anims.play(`char-erik-walk-${want}`, true);
    this.tweens.add({
      targets: this.player,
      x: nx * TILE + 8, y: ny * TILE + 16,
      duration: MOVE_MS,
      onUpdate: () => { if (this.player.active) this.player.setDepth(10 + Math.round((this.player.y - 16) / TILE)); },
      onComplete: () => {
        this.moving = false;
        if (!this.player.active) return;
        this.player.setDepth(10 + ny);
        const st = session.game.state;
        st.x = nx; st.y = ny; st.dir = this.dir;
        this.checkDoor();
      },
    });
  }

  private checkDoor(): void {
    const d = this.map.doors.find((dd) => dd.x === this.px && dd.y === this.py);
    if (!d) return;
    this.warp(d.to.map, d.to.x, d.to.y, d.to.dir ?? 'down', d.sfx ?? 'door');
  }

  warp(mapId: string, x: number, y: number, dir: Dir, sfx = 'door'): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.ready = false;
    audio.sfx(sfx);
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.loadMap(mapId, x, y, dir);
      this.cameras.main.fadeIn(220, 0, 0, 0);
      this.cameras.main.once('camerafadeincomplete', () => {
        this.transitioning = false;
        this.ready = true;
        session.game.save();
        this.onMapEntered();
      });
    });
  }

  // ---------------- Sunday service set piece ----------------
  private placePlayer(x: number, y: number, dir: Dir): void {
    this.tweens.killTweensOf(this.player);
    this.moving = false;
    this.px = x; this.py = y; this.dir = dir;
    this.player.setPosition(x * TILE + 8, y * TILE + 16).setDepth(10 + y);
    this.player.anims.stop(); this.player.setFrame(DIR_FRAME[dir]);
    const st = session.game.state; st.x = x; st.y = y; st.dir = dir;
  }

  /** Fill the sanctuary with the congregation (back row first, as is tradition). */
  startService(): void {
    if (this.map.id !== 'church' || this.inService) return;
    this.inService = true;
    const g = session.game;
    const n = Math.max(6, Math.min(30, Math.round(8 + g.state.morale * 0.22 + g.state.goodwill * 0.12 + g.state.allies.length * 2 + g.getStat('sundays') * 0.5)));
    g.set('attendance', n);
    if (n > g.getStat('maxAttendance')) g.state.stats.maxAttendance = n;
    const seats: [number, number][] = [];
    for (const y of [11, 9, 7, 5]) for (const x of [4, 6, 8, 15, 17, 19]) seats.push([x, y]);
    const standing: [number, number][] = [[10, 13], [13, 13], [11, 13], [12, 13], [9, 13], [14, 13]];
    const roster: string[] = [];
    const add = (id: string) => { if (!roster.includes(id)) roster.push(id); };
    ['doug', 'marcus', 'janet', 'sam', 'tanya', 'hannah', 'julie', 'eli', 'richard', 'member1', 'member2', 'mason', 'dennis'].forEach(add);
    ['pruitt', 'gary', 'linda', 'tonya', 'harold', 'whitlock', 'dale', 'ronnie'].forEach((id) => { if (g.isAlly(id)) add(id); });
    if (g.has('reyesTalked')) add('reyes');
    this.npcs.forEach((np) => { if (np.placement.id !== 'kyle' && np.placement.id !== 'brayden') np.sprite.setVisible(false); });
    for (let i = 0; i < n; i++) {
      const pos = i < seats.length ? seats[i] : standing[i - seats.length];
      if (!pos) break;
      const key = i < roster.length ? `char-${roster[i]}` : `char-crowd-${(i - roster.length) % CROWD_COUNT}`;
      const spr = this.add.sprite(pos[0] * TILE + 8, pos[1] * TILE + 16, key, 3).setOrigin(0.5, 1).setDepth(10 + pos[1]).setAlpha(0);
      this.tweens.add({ targets: spr, alpha: 1, duration: 250, delay: 40 * i });
      this.crowd.push(spr);
    }
    this.placePlayer(12, 3, 'down');
    audio.play('worship');
  }

  /** "Amen" floaters over a few congregants (big = the whole room). */
  amenBurst(big = false): void {
    if (!this.crowd.length) return;
    const words = ['Amen!', 'Mm-hm.', "C'mon!", "That's right.", 'Preach.', 'Yes sir.', 'Well!', 'Come on now.'];
    const count = Math.min(this.crowd.length, big ? 8 : 3);
    const picked = Phaser.Utils.Array.Shuffle(this.crowd.slice()).slice(0, count);
    picked.forEach((spr, i) => {
      this.time.delayedCall(i * 120, () => {
        if (!spr.active) return;
        const t = this.add.text(spr.x, spr.y - 26, words[Math.floor(Math.random() * words.length)], { fontFamily: 'PressStart', fontSize: '8px', color: '#ffd27f', resolution: 1 }).setOrigin(0.5, 1).setDepth(500);
        t.setShadow(1, 1, '#000', 0, false, true);
        this.tweens.add({ targets: t, y: t.y - 12, alpha: 0, duration: 1100, ease: 'Sine.out', onComplete: () => t.destroy() });
        this.tweens.add({ targets: spr, y: spr.y - 3, duration: 90, yoyo: true });
        audio.sfx(big && i === 0 ? 'bell' : 'blip');
      });
    });
    if (big) this.cameras.main.flash(120, 255, 240, 200);
  }

  /** Coins rise from the congregation to the fund counter. */
  offeringFx(): void {
    if (!this.crowd.length) return;
    const cam = this.cameras.main;
    const picked = Phaser.Utils.Array.Shuffle(this.crowd.slice()).slice(0, 8);
    picked.forEach((spr, i) => {
      this.time.delayedCall(i * 110, () => {
        if (!spr.active) return;
        const c = this.add.image(spr.x, spr.y - 12, 'icon-fund').setDepth(600);
        this.tweens.add({ targets: c, x: cam.scrollX + 10, y: cam.scrollY + 9, duration: 700, ease: 'Cubic.in', onComplete: () => { c.destroy(); audio.sfx('coin'); } });
      });
    });
  }

  /** The congregation heads to the lobby; regular life resumes. */
  endService(): void {
    if (!this.inService) return;
    this.inService = false;
    this.crowd.forEach((c, i) => this.tweens.add({ targets: c, alpha: 0, duration: 250, delay: 20 * i, onComplete: () => c.destroy() }));
    this.crowd = [];
    this.npcs.forEach((np) => np.sprite.setVisible(true));
    this.placePlayer(12, 3, 'up');
    audio.play(this.map.music);
  }

  /** Small floating text over the player (used for muttered fake curses). */
  private mutter(txt: string): void {
    const t = this.add.text(this.player.x, this.player.y - 28, txt, { fontFamily: 'PressStart', fontSize: '8px', color: '#ff7a7a', resolution: 1 }).setOrigin(0.5, 1).setDepth(500);
    t.setShadow(1, 1, '#000', 0, false, true);
    this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 900, ease: 'Sine.out', onComplete: () => t.destroy() });
  }

  // ---------------- Guidance: quest marker ----------------
  /** Arrow over the next objective; at the screen edge when it is far; over the right door when it is in another map. */
  private updateMarker(time: number): void {
    const m = this.marker, lbl = this.markerLabel, bg = this.markerBg;
    if (!m || !lbl || !bg) return;
    const g = session.game;
    const ui = this.ui;
    const t = (!g.has('markerOff') && !this.inService && !(ui && ui.menuIsOpen)) ? questTarget(g) : null;
    const hide = () => { m.setVisible(false); lbl.setVisible(false); bg.clear(); };
    if (!t) { hide(); return; }
    let tx = t.x, ty = t.y, label = t.label;
    if (t.map !== this.map.id) {
      const d = nextDoor(this.map.id, t.map);
      if (!d) { hide(); return; }
      tx = d.x; ty = d.y;
      label = `${t.label} (${MAP_SHORT[t.map] ?? t.map})`;
    }
    if (Math.abs(tx - this.px) + Math.abs(ty - this.py) <= 1) { hide(); return; }
    const cam = this.cameras.main;
    const wx = tx * TILE + 8, wy = ty * TILE - 14;
    const x0 = cam.scrollX + 10, x1 = cam.scrollX + W - 10, y0 = cam.scrollY + 28, y1 = cam.scrollY + H - 12;
    const bob = Math.round(Math.sin(time / 170) * 2);
    m.setVisible(true); lbl.setVisible(true).setText(label);
    if (wx >= x0 && wx <= x1 && wy >= y0 && wy <= y1) {
      m.setPosition(wx, wy + bob).setRotation(0);
      lbl.setPosition(wx, wy - 6 + bob);
    } else {
      const cx = Phaser.Math.Clamp(wx, x0, x1), cy = Phaser.Math.Clamp(wy, y0, y1);
      const ang = Math.atan2(wy - cy, wx - cx);
      m.setPosition(cx, cy).setRotation(ang - Math.PI / 2);
      const lw = lbl.displayWidth / 2;
      lbl.setPosition(Phaser.Math.Clamp(cx - Math.cos(ang) * 16, cam.scrollX + lw + 2, cam.scrollX + W - lw - 2), cy - Math.sin(ang) * 16 + 4);
    }
    bg.clear();
    bg.fillStyle(0x101018, 0.65);
    bg.fillRect(Math.round(lbl.x - lbl.displayWidth / 2 - 2), Math.round(lbl.y - lbl.displayHeight - 1), Math.round(lbl.displayWidth + 4), Math.round(lbl.displayHeight + 2));
  }

  // ---------------- Living world: cars, birds, rain ----------------
  private setupAmbient(): void {
    const g = session.game;
    if (!this.map.indoor && g.has('rainToday')) {
      this.rainTint = this.add.graphics().setScrollFactor(0).setDepth(940);
      this.rainTint.fillStyle(0x1a2a4a, 0.28); this.rainTint.fillRect(0, 0, W, H);
      this.rainFx = this.add.particles(0, 0, 'raindrop', {
        x: { min: -20, max: W + 60 }, y: -8,
        lifespan: 800, speedY: { min: 260, max: 330 }, speedX: { min: -55, max: -35 },
        quantity: 2, frequency: 12, alpha: { start: 0.85, end: 0.3 },
      }).setScrollFactor(0).setDepth(945);
      audio.rain(true);
    }
    this.nextCar = this.time.now + 1500 + Math.random() * 3000;
    this.nextBirds = this.time.now + 5000 + Math.random() * 8000;
  }

  private occupied(x: number, y: number): boolean {
    if (x === this.px && y === this.py) return true;
    return this.npcs.some((n) => n.x === x && n.y === y);
  }

  spawnCar(axis: 'h' | 'v' = Math.random() < 0.65 ? 'h' : 'v', dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1): void {
    if (this.map.id !== 'town' || this.cars.length) return;
    const key = `car-${Math.floor(Math.random() * 6)}`;
    const mw = this.map.w * TILE, mh = this.map.h * TILE;
    let spr: Phaser.GameObjects.Image;
    if (axis === 'h') {
      const lane = dir === 1 ? 19 : 17; // drive on the right
      spr = this.add.image(dir === 1 ? -20 : mw + 20, lane * TILE + 8, key).setDepth(10 + lane);
      if (dir === -1) spr.setFlipX(true);
    } else {
      const lane = dir === 1 ? 12 : 14;
      spr = this.add.image(lane * TILE + 8, dir === 1 ? -20 : mh + 20, key).setDepth(10);
      spr.setRotation(dir === 1 ? Math.PI / 2 : -Math.PI / 2);
    }
    this.cars.push({ spr, axis, dir, v: 0, stopped: 0, honked: false });
  }

  /** Cars cruise the roads and brake for anyone standing in the lane. */
  private updateCars(time: number, delta: number): void {
    if (this.map.id === 'town' && time > this.nextCar) { this.spawnCar(); this.nextCar = time + 6000 + Math.random() * 8000; }
    const cruise = 72;
    const mw = this.map.w * TILE, mh = this.map.h * TILE;
    for (const car of this.cars.slice()) {
      const s = car.spr;
      const cx = Math.floor(s.x / TILE), cy = Math.floor(s.y / TILE);
      let blocked = false, near = false, target = cruise;
      for (let k = 1; k <= 3; k++) {
        const tx = car.axis === 'h' ? cx + k * car.dir : cx;
        const ty = car.axis === 'v' ? cy + k * car.dir : cy;
        if (this.occupied(tx, ty)) { blocked = true; near = k <= 1; target = near ? 0 : cruise * (k - 1) * 0.3; break; }
      }
      if (near) car.v = 0; else car.v += (target - car.v) * Math.min(1, delta / (blocked ? 140 : 420));
      if (blocked) {
        car.stopped += delta;
        if (car.stopped > 1300 && !car.honked) { car.honked = true; audio.sfx('honk'); session.game.stat('honks'); }
      } else { car.stopped = 0; car.honked = false; }
      const step = (car.v * delta) / 1000 * car.dir;
      if (car.axis === 'h') s.x += step; else { s.y += step; s.setDepth(10 + Math.floor(s.y / TILE)); }
      if (s.x < -40 || s.x > mw + 40 || s.y < -40 || s.y > mh + 40) { s.destroy(); this.cars = this.cars.filter((c) => c !== car); }
    }
  }

  private spawnBirds(): void {
    const cam = this.cameras.main;
    const fromLeft = Math.random() < 0.5;
    const n = 2 + Math.floor(Math.random() * 3);
    const y0 = cam.scrollY + 24 + Math.random() * (H * 0.45);
    for (let i = 0; i < n; i++) {
      const spr = this.add.image(fromLeft ? cam.scrollX - 20 - i * 10 : cam.scrollX + W + 20 + i * 10, y0 + (i % 2) * 6, 'bird-0').setDepth(950);
      this.birds.push({ spr, vx: (fromLeft ? 1 : -1) * (50 + Math.random() * 20), vy: -5 + Math.random() * 10, phase: Math.random() * 1000 });
    }
    audio.sfx('chirp');
  }

  private updateBirds(time: number, delta: number): void {
    if (this.map.id === 'town' && time > this.nextBirds && !session.game.has('rainToday')) { this.spawnBirds(); this.nextBirds = time + 14000 + Math.random() * 16000; }
    const cam = this.cameras.main;
    for (const b of this.birds.slice()) {
      b.spr.x += (b.vx * delta) / 1000;
      b.spr.y += ((b.vy + Math.sin((time + b.phase) / 300) * 8) * delta) / 1000;
      b.spr.setTexture(Math.floor((time + b.phase) / 140) % 2 ? 'bird-1' : 'bird-0');
      if (b.spr.x < cam.scrollX - 80 || b.spr.x > cam.scrollX + W + 80) { b.spr.destroy(); this.birds = this.birds.filter((x) => x !== b); }
    }
  }

  // ---------------- Interaction ----------------
  private interact(): void {
    const [dx, dy] = DIR_VEC[this.dir];
    const tx = this.px + dx, ty = this.py + dy;
    const npc = this.npcs.find((n) => n.x === tx && n.y === ty);
    if (npc) { this.talkTo(npc); return; }
    // over-the-counter talk takes priority over the counter itself
    const tname = this.map.objects[ty]?.[tx] ?? this.map.ground[ty]?.[tx];
    if (tname && COUNTER_TILES.has(tname)) {
      const npc2 = this.npcs.find((n) => n.x === tx + dx && n.y === ty + dy);
      if (npc2) { this.talkTo(npc2); return; }
    }
    const it = this.map.interacts.find((i) => i.x === tx && i.y === ty);
    if (it) { this.ui.startDialogueFor(it.dialogue); return; }
  }

  private talkTo(npc: NpcSprite): void {
    // face each other
    const facing: Dir = this.dir === 'up' ? 'down' : this.dir === 'down' ? 'up' : this.dir === 'left' ? 'right' : 'left';
    npc.sprite.setFrame(DIR_FRAME[facing]);
    npc.dir = facing;
    this.ui.startDialogueFor(npc.placement.dialogue);
  }

  // ---------------- NPC wandering ----------------
  private updateNpcs(time: number): void {
    for (const n of this.npcs) {
      if (!n.placement.wander || n.moving || time < n.nextWander) continue;
      n.nextWander = time + 1500 + Math.random() * 2500;
      const dirs: Dir[] = ['up', 'down', 'left', 'right'];
      const d = dirs[Math.floor(Math.random() * 4)];
      const [dx, dy] = DIR_VEC[d];
      const nx = n.x + dx, ny = n.y + dy;
      if (Math.abs(nx - n.homeX) > 2 || Math.abs(ny - n.homeY) > 2) { n.sprite.setFrame(DIR_FRAME[d]); n.dir = d; continue; }
      if (this.blocked(nx, ny) || (nx === this.px && ny === this.py)) { n.sprite.setFrame(DIR_FRAME[d]); n.dir = d; continue; }
      if (this.map.doors.some((dd) => dd.x === nx && dd.y === ny)) continue;
      n.moving = true; n.dir = d;
      n.x = nx; n.y = ny;
      n.sprite.anims.play(`char-${n.placement.id}-walk-${d}`, true);
      this.tweens.add({
        targets: n.sprite, x: nx * TILE + 8, y: ny * TILE + 16, duration: 260,
        onComplete: () => { n.moving = false; if (!n.sprite.active) return; n.sprite.anims.stop(); n.sprite.setFrame(DIR_FRAME[d]); n.sprite.setDepth(10 + ny); },
      });
    }
  }

  // ---------------- Day cycle ----------------
  /** Rest: fade to black, advance the day, restore energy, maybe trigger an event. */
  rest(onDone?: () => void): void {
    if (this.transitioning) return;
    this.transitioning = true;
    const g = session.game;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      g.state.day += 1;
      g.stat('rests');
      g.change('energy', BALANCE.restEnergy);
      g.set('coffeeToday', false);
      g.set('preachedToday', false);
      g.set('rainToday', false);
      g.state.eventCooldown -= 1;
      let eventId: string | null = null;
      if (g.state.eventCooldown <= 0 && Math.random() < BALANCE.eventChance) {
        eventId = pickRandomEvent(g);
        if (eventId) g.state.eventCooldown = BALANCE.eventCooldownDays;
      }
      g.save();
      this.time.delayedCall(400, () => {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.once('camerafadeincomplete', () => {
          this.transitioning = false;
          this.ui.toast(`Week ${g.state.day}. Sunday comes fast. Energy restored.`);
          if (eventId) this.ui.startDialogue(eventId);
          onDone?.();
        });
      });
    });
  }

  startEnding(kind: 'buy' | 'build'): void {
    session.game.state.ending = kind;
    session.game.save();
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UI');
      this.scene.start('Ending', { kind });
    });
  }

  /** Tile name under/at a position (for debugging and tests). */
  tileAt(x: number, y: number): string | null { return this.map.objects[y]?.[x] ?? this.map.ground[y]?.[x] ?? this.map.fill; }
  isSolidTileName(name: string): boolean { return !!TILES[name]?.solid; }
  debugTeleport(mapId: string, x: number, y: number): void { this.loadMap(mapId, x, y, 'down'); this.ready = true; this.onMapEntered(); }
}
