/**
 * The cast. Visual specs feed the sprite/portrait generators.
 * Add a character here, then place them in a map (src/data/maps.ts) and give them dialogue.
 */
import type { CharacterSpec } from '../art/characters';
import type { PortraitSpec } from '../art/portraits';
import { PERSONAL } from '../config/personal';

export interface CastMember {
  id: string;
  name: string;
  sprite: CharacterSpec;
  portrait: PortraitSpec;
  /** special non-human portraits are drawn from icons */
  icon?: 'thread' | 'form' | 'thermostat' | 'crowd' | 'carpet';
}

const SKIN = { tan: '#c9a27a', light: '#ecc9a5', pale: '#f3d9c0', brown: '#8d5a3a', deep: '#5e3a22', olive: '#d4b48c' };

export const CAST: Record<string, CastMember> = {
  erik: {
    id: 'erik', name: PERSONAL.heroTitle,
    sprite: { skin: SKIN.tan, hair: '#221812', shirt: PERSONAL.favoriteTeamColor.toString(16).length === 6 ? '#' + PERSONAL.favoriteTeamColor.toString(16) : '#73000a', pants: '#2b3a55', hairStyle: 'bald', beard: true, vest: true, tattoo: true },
    portrait: { skin: SKIN.tan, hair: '#221812', shirt: '#23232b', hairStyle: 'bald', beard: true },
  },
  erikcap: {
    id: 'erikcap', name: PERSONAL.heroNickname,
    sprite: { skin: SKIN.tan, hair: '#221812', shirt: '#73000a', pants: '#2b3a55', hairStyle: 'cap', beard: true, capColor: '#111118', tattoo: true },
    portrait: { skin: SKIN.tan, hair: '#221812', shirt: '#73000a', hairStyle: 'cap', beard: true, capColor: '#111118' },
  },
  tim: {
    id: 'tim', name: PERSONAL.sageName,
    sprite: { skin: SKIN.light, hair: '#5a4a3a', shirt: '#3a6ea5', pants: '#4a4a52', hairStyle: 'bald', glasses: true },
    portrait: { skin: SKIN.light, hair: '#5a4a3a', shirt: '#3a6ea5', hairStyle: 'bald', glasses: true },
  },
  kyle: {
    id: 'kyle', name: 'Kyle (Sound Guy)',
    sprite: { skin: SKIN.pale, hair: '#6b4a2a', shirt: '#1a1a1e', pants: '#2b2b33', hairStyle: 'short' },
    portrait: { skin: SKIN.pale, hair: '#6b4a2a', shirt: '#1a1a1e', hairStyle: 'short' },
  },
  brayden: {
    id: 'brayden', name: 'Brayden (Slides)',
    sprite: { skin: SKIN.light, hair: '#e0c060', shirt: '#4a4a8a', pants: '#333', hairStyle: 'short' },
    portrait: { skin: SKIN.light, hair: '#e0c060', shirt: '#4a4a8a', hairStyle: 'short' },
  },
  tasha: {
    id: 'tasha', name: 'Tasha (Nursery)',
    sprite: { skin: SKIN.brown, hair: '#1a1210', shirt: '#f0c030', pants: '#3a3a5a', hairStyle: 'long' },
    portrait: { skin: SKIN.brown, hair: '#1a1210', shirt: '#f0c030', hairStyle: 'curly', earrings: true },
  },
  dennis: {
    id: 'dennis', name: 'Dennis',
    sprite: { skin: SKIN.pale, hair: '#9a9a9a', shirt: '#4a5a3a', pants: '#5a5a4a', hairStyle: 'long', beard: true },
    portrait: { skin: SKIN.pale, hair: '#9a9a9a', shirt: '#4a5a3a', hairStyle: 'long', beard: true },
  },
  dale: {
    id: 'dale', name: 'Dale (HVAC)',
    sprite: { skin: SKIN.light, hair: '#8a7a6a', shirt: '#2f5f9f', pants: '#3a3a44', hairStyle: 'cap', beard: true, capColor: '#8a7a50' },
    portrait: { skin: SKIN.light, hair: '#8a7a6a', shirt: '#2f5f9f', hairStyle: 'cap', beard: true, capColor: '#8a7a50' },
  },
  ronnie: {
    id: 'ronnie', name: 'Big Ronnie',
    sprite: { skin: SKIN.olive, hair: '#3a2a1a', shirt: '#ff7a1a', pants: '#3a4a6a', hairStyle: 'cap', beard: true, capColor: '#b02020', tattoo: true },
    portrait: { skin: SKIN.olive, hair: '#3a2a1a', shirt: '#ff7a1a', hairStyle: 'cap', beard: true, capColor: '#b02020' },
  },
  pruitt: {
    id: 'pruitt', name: 'Mrs. Pruitt',
    sprite: { skin: SKIN.pale, hair: '#d8d8e0', shirt: '#a080c0', pants: '#6a6a7a', hairStyle: 'bun', glasses: true },
    portrait: { skin: SKIN.pale, hair: '#d8d8e0', shirt: '#a080c0', hairStyle: 'bun', glasses: true, lipstick: true, earrings: true },
  },
  harold: {
    id: 'harold', name: 'Deacon Emeritus Harold',
    sprite: { skin: SKIN.light, hair: '#c0c0c8', shirt: '#7a5a3a', pants: '#4a4a5a', hairStyle: 'short', glasses: true },
    portrait: { skin: SKIN.light, hair: '#c0c0c8', shirt: '#7a5a3a', hairStyle: 'short', glasses: true },
  },
  gary: {
    id: 'gary', name: 'Gary (Next Door)',
    sprite: { skin: SKIN.pale, hair: '#a0a0a0', shirt: '#e8e8e8', pants: '#5a5a6a', hairStyle: 'bald' },
    portrait: { skin: SKIN.pale, hair: '#a0a0a0', shirt: '#e8e8e8', hairStyle: 'bald' },
  },
  linda: {
    id: 'linda', name: 'Linda (Across the Lot)',
    sprite: { skin: SKIN.pale, hair: '#b04a2a', shirt: '#2aa0a0', pants: '#4a4a6a', hairStyle: 'long' },
    portrait: { skin: SKIN.pale, hair: '#b04a2a', shirt: '#2aa0a0', hairStyle: 'long', lipstick: true, earrings: true },
  },
  tonya: {
    id: 'tonya', name: 'Tonya (Apartments)',
    sprite: { skin: SKIN.deep, hair: '#1a1210', shirt: '#7a3a9a', pants: '#2a2a3a', hairStyle: 'long' },
    portrait: { skin: SKIN.deep, hair: '#1a1210', shirt: '#7a3a9a', hairStyle: 'curly', lipstick: true },
  },
  bev: {
    id: 'bev', name: 'Bev (Permits)',
    sprite: { skin: SKIN.pale, hair: '#c8b890', shirt: '#4a8a4a', pants: '#3a3a4a', hairStyle: 'long', glasses: true },
    portrait: { skin: SKIN.pale, hair: '#c8b890', shirt: '#4a8a4a', hairStyle: 'long', glasses: true, lipstick: true },
  },
  paulette: {
    id: 'paulette', name: 'Paulette (Grants)',
    sprite: { skin: SKIN.brown, hair: '#2a1a10', shirt: '#c04060', pants: '#2a2a3a', hairStyle: 'bun', glasses: true },
    portrait: { skin: SKIN.brown, hair: '#2a1a10', shirt: '#c04060', hairStyle: 'bun', glasses: true, lipstick: true },
  },
  whitlock: {
    id: 'whitlock', name: 'Mr. Whitlock',
    sprite: { skin: SKIN.pale, hair: '#e8e8e8', shirt: '#1a2a5a', pants: '#3a3a3a', hairStyle: 'short' },
    portrait: { skin: SKIN.pale, hair: '#e8e8e8', shirt: '#1a2a5a', hairStyle: 'short' },
  },
  jess: {
    id: 'jess', name: 'Jess (Barista)',
    sprite: { skin: SKIN.light, hair: '#3a2a4a', shirt: '#6a4a2a', pants: '#2a2a2a', hairStyle: 'bun', tattoo: true },
    portrait: { skin: SKIN.light, hair: '#3a2a4a', shirt: '#6a4a2a', hairStyle: 'bun', lipstick: true, earrings: true },
  },
  doug: {
    id: 'doug', name: 'Elder Doug',
    sprite: { skin: SKIN.tan, hair: '#5a4a3a', shirt: '#2a6a3a', pants: '#3a3a44', hairStyle: 'short', beard: true },
    portrait: { skin: SKIN.tan, hair: '#5a4a3a', shirt: '#2a6a3a', hairStyle: 'short', beard: true },
  },
  marcus: {
    id: 'marcus', name: 'Elder Marcus',
    sprite: { skin: SKIN.deep, hair: '#101010', shirt: '#9ac0e8', pants: '#2a2a3a', hairStyle: 'short', glasses: true },
    portrait: { skin: SKIN.deep, hair: '#101010', shirt: '#9ac0e8', hairStyle: 'short', glasses: true },
  },
  janet: {
    id: 'janet', name: 'Elder Janet',
    sprite: { skin: SKIN.pale, hair: '#b0b0b8', shirt: '#7a2040', pants: '#3a3a4a', hairStyle: 'short' },
    portrait: { skin: SKIN.pale, hair: '#b0b0b8', shirt: '#7a2040', hairStyle: 'short', lipstick: true, earrings: true },
  },
  brenda: {
    id: 'brenda', name: 'Brenda (Realtor)',
    sprite: { skin: SKIN.light, hair: '#e8d080', shirt: '#c02020', pants: '#2a2a2a', hairStyle: 'bun' },
    portrait: { skin: SKIN.light, hair: '#e8d080', shirt: '#c02020', hairStyle: 'bun', lipstick: true, earrings: true },
  },
  hank: {
    id: 'hank', name: 'Hank (Contractor)',
    sprite: { skin: SKIN.olive, hair: '#4a3a2a', shirt: '#b03030', pants: '#3a4a6a', hairStyle: 'cap', beard: true, capColor: '#e8c020' },
    portrait: { skin: SKIN.olive, hair: '#4a3a2a', shirt: '#b03030', hairStyle: 'cap', beard: true, capColor: '#e8c020' },
  },
  mason: {
    id: 'mason', name: 'Mason (Age 11)',
    sprite: { skin: SKIN.brown, hair: '#1a1210', shirt: '#3aa050', pants: '#2a2a3a', hairStyle: 'short' },
    portrait: { skin: SKIN.brown, hair: '#1a1210', shirt: '#3aa050', hairStyle: 'short' },
  },
  member1: {
    id: 'member1', name: 'Church Member',
    sprite: { skin: SKIN.light, hair: '#8a5a3a', shirt: '#d05050', pants: '#3a3a4a', hairStyle: 'long' },
    portrait: { skin: SKIN.light, hair: '#8a5a3a', shirt: '#d05050', hairStyle: 'long' },
  },
  reyes: {
    id: 'reyes', name: 'Specialist Reyes',
    sprite: { skin: SKIN.brown, hair: '#1a1210', shirt: '#5a6a3a', pants: '#4a5a3a', hairStyle: 'cap', capColor: '#4a5a3a' },
    portrait: { skin: SKIN.brown, hair: '#1a1210', shirt: '#5a6a3a', hairStyle: 'cap', capColor: '#4a5a3a' },
  },
  member2: {
    id: 'member2', name: 'Church Member',
    sprite: { skin: SKIN.brown, hair: '#1a1210', shirt: '#5080d0', pants: '#3a3a4a', hairStyle: 'short' },
    portrait: { skin: SKIN.brown, hair: '#1a1210', shirt: '#5080d0', hairStyle: 'short' },
  },
  // Non-human "opponents" (portrait drawn as icons)
  thread: { id: 'thread', name: 'The Email Thread', icon: 'thread', sprite: { skin: '#fff', hair: '#fff', shirt: '#fff', pants: '#fff', hairStyle: 'bald' }, portrait: { skin: '#fff', hair: '#fff', shirt: '#fff', hairStyle: 'bald' } },
  form: { id: 'form', name: 'The Grant Form', icon: 'form', sprite: { skin: '#fff', hair: '#fff', shirt: '#fff', pants: '#fff', hairStyle: 'bald' }, portrait: { skin: '#fff', hair: '#fff', shirt: '#fff', hairStyle: 'bald' } },
  crowd: { id: 'crowd', name: 'The Back Row', icon: 'crowd', sprite: { skin: '#fff', hair: '#fff', shirt: '#fff', pants: '#fff', hairStyle: 'bald' }, portrait: { skin: '#fff', hair: '#fff', shirt: '#fff', hairStyle: 'bald' } },
  carpet: { id: 'carpet', name: 'The Carpet Question', icon: 'carpet', sprite: { skin: '#fff', hair: '#fff', shirt: '#fff', pants: '#fff', hairStyle: 'bald' }, portrait: { skin: '#fff', hair: '#fff', shirt: '#fff', hairStyle: 'bald' } },
};

export function castName(id: string | undefined): string {
  if (!id) return '';
  return CAST[id]?.name ?? id;
}
