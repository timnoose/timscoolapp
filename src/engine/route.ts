/**
 * Door routing between maps. Used by the quest marker to point at the door that
 * leads toward an objective in another map (office -> church -> town -> coffee).
 */
import { MAPS } from '../data/maps';
import type { Door } from './mapdef';

const cache = new Map<string, Door | null>();

/** The door in `from` that starts the shortest path to map `to` (null if none / same map). */
export function nextDoor(from: string, to: string): Door | null {
  if (from === to) return null;
  const key = `${from}>${to}`;
  if (cache.has(key)) return cache.get(key)!;
  // breadth-first over the map graph, remembering the first door taken
  const seen = new Set<string>([from]);
  const queue: { map: string; first: Door }[] = [];
  for (const d of MAPS[from]?.doors ?? []) {
    if (!seen.has(d.to.map)) { seen.add(d.to.map); queue.push({ map: d.to.map, first: d }); }
  }
  let found: Door | null = null;
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.map === to) { found = cur.first; break; }
    for (const d of MAPS[cur.map]?.doors ?? []) {
      if (!seen.has(d.to.map)) { seen.add(d.to.map); queue.push({ map: d.to.map, first: cur.first }); }
    }
  }
  cache.set(key, found);
  return found;
}

/** Where a map's entrance sits on the town map (for the overview map). */
export function townEntrance(mapId: string): { x: number; y: number } | null {
  if (mapId === 'town') return null;
  const d = nextDoor(mapId, 'town');
  if (!d) return null;
  // walk to the town door coordinates
  let cur = mapId; let door: Door | null = d; let guard = 0;
  while (door && door.to.map !== 'town' && guard++ < 5) { cur = door.to.map; door = nextDoor(cur, 'town'); }
  return door ? { x: door.to.x, y: door.to.y } : null;
}
