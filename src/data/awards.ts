/**
 * Awards (achievements) and the end-of-game report card. Pure data + checks.
 * Stats are tracked in game.state.stats via game.stat('name').
 */
import type { Game } from '../engine/state';
import { PERSONAL } from '../config/personal';

export interface AwardDef {
  id: string;
  title: string;
  desc: string;      // shown once unlocked
  hint: string;      // shown while locked
  check: (g: Game) => boolean;
}

export const AWARDS: AwardDef[] = [
  { id: 'firstSunday', title: 'Sunday Is Coming', desc: 'Preached your first Sunday in the warehouse.', hint: 'Preach a Sunday.', check: (g) => g.getStat('sundays') >= 1 },
  { id: 'listener', title: 'Quick to Listen', desc: 'Listened first in five encounters. James 1:19, applied.', hint: 'Listen first, often.', check: (g) => g.getStat('listens') >= 5 },
  { id: 'heman', title: 'What Would He-Man Do?', desc: 'Won an encounter without listening at all. Bold. Unwise. Effective.', hint: 'Win without listening once.', check: (g) => g.getStat('winsNoListen') >= 1 },
  { id: 'coffee10', title: 'Fire Extinguisher', desc: 'Drank ten fire-extinguisher coffees. Your heart is a drum solo.', hint: 'Drink a lot of coffee.', check: (g) => g.getStat('coffees') >= 10 },
  { id: 'bench', title: 'Bench 300', desc: 'Lifted in the office five times. The elders have no questions.', hint: 'Use the bench press five times.', check: (g) => g.getStat('lifts') >= 5 },
  { id: 'wall', title: 'Load-Bearing Pastor', desc: 'Walked into walls fifty times. The warehouse is sturdy.', hint: 'Bump into things. A lot.', check: (g) => g.getStat('bumps') >= 50 },
  { id: 'sugar', title: 'He Said Sugar', desc: 'Fake-cursed ten times. The livestream has questions.', hint: 'Let setbacks happen.', check: (g) => g.getStat('curses') >= 10 },
  { id: 'truck', title: 'Volunteer With a Truck', desc: 'Let a truck solve a problem that was not about trucks.', hint: 'Bring Ronnie to the right conversation.', check: (g) => g.getStat('truckSolves') >= 1 },
  { id: 'noReplyAll', title: 'Inbox Zero-ish', desc: 'Ended the Reply-All thread on the first try.', hint: 'Win the email thread without losing first.', check: (g) => g.has('threadFirstTry') },
  { id: 'neighbors', title: 'Love Thy Actual Neighbor', desc: 'Every neighbor became an ally.', hint: 'Win over Gary, Linda and Monique.', check: (g) => g.isAlly('gary') && g.isAlly('linda') && g.isAlly('tonya') },
  { id: 'slam', title: PERSONAL.wrestlingEventName + ' Champion', desc: 'Pinned the Masked Deacon. Kayfabe, brother.', hint: 'Win the wrestling night.', check: (g) => g.has('eventDone') },
  { id: 'fullHouse', title: 'Full House', desc: 'Filled every chair on a Sunday. Standing room only.', hint: 'Grow attendance until the chairs run out.', check: (g) => g.getStat('maxAttendance') >= 24 },
  { id: 'allies8', title: 'It Takes a Town', desc: 'Eight allies by your side.', hint: 'Make eight allies.', check: (g) => g.state.allies.length >= 8 },
  { id: 'carpet', title: 'Carpet Survivor', desc: 'Survived the carpet discussion. Nobody remembers the color.', hint: 'Get through the elders.', check: (g) => g.questIs('elders', 'done') || g.questStage('elders') >= 3 },
  { id: 'ending', title: 'The Building Is the Receipt', desc: 'Got the church a home.', hint: 'Buy or build.', check: (g) => !!g.state.ending || g.has('finished_buy') || g.has('finished_build') },
];

/** Returns newly unlocked award ids and records them. */
export function checkAwards(g: Game): AwardDef[] {
  const fresh: AwardDef[] = [];
  for (const a of AWARDS) {
    if (g.hasAward(a.id)) continue;
    let ok = false;
    try { ok = a.check(g); } catch { ok = false; }
    if (ok) { g.state.awards.push(a.id); fresh.push(a); }
  }
  return fresh;
}

export interface Grade { subject: string; grade: string; note: string }

function letter(x: number): string {
  if (x >= 0.9) return 'A+'; if (x >= 0.8) return 'A'; if (x >= 0.7) return 'B'; if (x >= 0.55) return 'C'; if (x >= 0.4) return 'D'; return 'F';
}

/** The pastor's report card for the credits. */
export function reportCard(g: Game): Grade[] {
  const s = g.state;
  const enc = Math.max(1, g.getStat('encounters'));
  const listenRate = g.getStat('listens') / enc;
  const winRate = g.getStat('encountersWon') / enc;
  return [
    { subject: 'Listening', grade: letter(listenRate), note: `${g.getStat('listens')} of ${enc} conversations started with Listen` },
    { subject: 'Resolve', grade: letter(winRate), note: `${g.getStat('encountersWon')} won, ${g.getStat('encountersLost')} lost, ${g.getStat('retreats')} walked away` },
    { subject: 'Neighborliness', grade: letter(s.goodwill / 100), note: `Goodwill ${s.goodwill}` },
    { subject: 'Shepherding', grade: letter(s.morale / 100), note: `Morale ${s.morale}, ${g.getStat('sundays')} Sundays, best attendance ${g.getStat('maxAttendance')}` },
    { subject: 'Self-care', grade: letter(Math.min(1, g.getStat('rests') / Math.max(1, s.day - 1)) * 0.6 + Math.min(1, g.getStat('coffees') / 8) * 0.4), note: `${g.getStat('coffees')} coffees, ${g.getStat('rests')} nights on the couch` },
    { subject: 'Language', grade: g.getStat('curses') === 0 ? 'A+' : g.getStat('curses') < 5 ? 'B' : g.getStat('curses') < 12 ? 'C' : 'D', note: `${g.getStat('curses')} symbol strings. He said sugar.` },
  ];
}
