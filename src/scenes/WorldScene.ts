import Phaser from 'phaser';
import { MAPS } from '../data/maps';
import { CAST } from '../data/cast';
import { TILE, TILE_INDEX, TILE_SOLID } from '../engine/textures';
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

const COUNTER_TILES = new Set(['cafeCounter', 'espresso', 'pastryCase', 'cityCounter', 'counterL', 'counterCoffee', 'counterR', 'grantDesk', 'desk', 'soundDesk', 'laptopTable']);
const DIR_FRAME: Record<Dir, number> = { down: 0, up: 3, left: 6, right: 9 };
const DIR_VEC: Record<Dir, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const MOVE_MS = 150;

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
  private transitioning = false;
  private ready = false;
  private lastPlaytime = 0;
  private mapLabel?: Phaser.GameObjects.Text;

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
    if (this.player) { this.tweens.killTweensOf(this.player); this.player.destroy(); }
    this.mapLabel?.destroy();
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
        if (this.bumps % 7 === 0) this.mutter(fakeCurse());
      }
      return;
    }
    this.moving = true;
    this.px = nx; this.py = ny;
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

  /** Small floating text over the player (used for muttered fake curses). */
  private mutter(txt: string): void {
    const t = this.add.text(this.player.x, this.player.y - 28, txt, { fontFamily: 'PressStart', fontSize: '8px', color: '#ff7a7a', resolution: 1 }).setOrigin(0.5, 1).setDepth(500);
    t.setShadow(1, 1, '#000', 0, false, true);
    this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 900, ease: 'Sine.out', onComplete: () => t.destroy() });
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
      g.change('energy', BALANCE.restEnergy);
      g.set('coffeeToday', false);
      g.set('preachedToday', false);
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
          this.ui.toast(`Day ${g.state.day}. Energy restored.`);
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
