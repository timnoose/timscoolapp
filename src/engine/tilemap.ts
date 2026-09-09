/** Builds ground + object tilemap layers for a MapDef (shared by scenes). */
import Phaser from 'phaser';
import type { MapDef } from './mapdef';
import { TILE, TILE_INDEX } from './textures';

export function buildLayers(scene: Phaser.Scene, def: MapDef): { map: Phaser.Tilemaps.Tilemap; ground: Phaser.Tilemaps.TilemapLayer; objects: Phaser.Tilemaps.TilemapLayer } {
  const map = scene.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: def.w, height: def.h });
  const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0, 1)!;
  const ground = map.createBlankLayer('ground', tileset)!;
  const objects = map.createBlankLayer('objects', tileset)!;
  for (let j = 0; j < def.h; j++) for (let i = 0; i < def.w; i++) {
    ground.putTileAt(TILE_INDEX[def.ground[j][i] ?? def.fill] + 1, i, j);
    const o = def.objects[j][i];
    if (o) objects.putTileAt(TILE_INDEX[o] + 1, i, j);
  }
  ground.setDepth(0); objects.setDepth(1);
  return { map, ground, objects };
}
