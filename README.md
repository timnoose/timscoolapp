# He-Erik-Man Quest: Building Edition

A 20–30 minute, 1990s-style top-down pixel RPG made as a gift for a church-planter friend.
Explore Clarksville, keep the warehouse church running, win over neighbors and elders in
Pokémon-style *social* encounters, raise a building fund, and end by **buying** a historic chapel
or **building** a brand-new campus (with an LED wall, c'mon).

No backend, no accounts, no APIs. A static build that runs in any modern browser, phone included.

## Play it

- **Hosted:** open the link you were sent (or deploy your own, see below).
- **Locally:** `npm install` then `npm run dev` and open the printed URL (http://localhost:5173).
- **Static build:** `npm run build` produces `dist/` – upload that folder anywhere (GitHub Pages, Netlify, Vercel, an S3 bucket, a church website subfolder).
- **Single file:** `npm run build:single` produces `dist/he-erik-man-quest.html`, one self-contained page (Phaser and the font load from CDNs) for hosts that only take a single HTML file.

### Controls

| Action | Keyboard | Phone |
|---|---|---|
| Move | Arrow keys / WASD | D-pad |
| Talk / confirm | Space / Enter | A |
| Back / close | Esc / X | B |
| Journal & menu | Esc / Tab / M | MENU |

Sound starts after the first key press or tap. Mute from the System tab of the menu (or `M` on the title).
Progress auto-saves at doors and after every conversation; **Continue** on the title screen resumes.

## What's in the game

- A walkable town (warehouse church, coffee shop, city hall, neighbors, a historic chapel for sale, an empty lot), three explorable interiors plus the pastor's office and two ending interiors.
- Four resources with on-screen feedback: **Building Fund**, **Community Goodwill**, **Congregation Morale**, **Pastor Energy**.
- Five main quests: *The HVAC Has Left the Chat*, *A Grave Misunderstanding*, *Love Thy Actual Neighbor*, *Capital Campaign of Destiny* (permit + HARVEST SLAM wrestling night, a 47-page grant form, a donor with restroom-naming ambitions), and *The Elders aka The Building Committee* (vision, money & the city, the carpet).
- Twelve turn-based social encounters with Listen / Explain Vision / Offer Coffee / Recruit Volunteer / Set a Boundary / Ask Wise Sage Tim / Call a Meeting, opponent moves like *Reply All*, *We've Never Done It That Way*, *Anonymous Email*, *Let's Form a Subcommittee*, and the legendary *Volunteer With a Truck*.
- Random events with cooldowns (roof leak, dead soundboard, missing trailer, surprise bills, anonymous gifts, a retired plumber named Walt), a repeatable Sunday-service income loop, resting, coffee.
- **Sunday service set piece:** the sanctuary fills up (back row first) based on morale, goodwill and allies; pick a sermon title (Kyle hints at the prepped one), amens, offering, then state-aware lobby chatter afterwards. Weeks tick by between Sundays.
- **Guidance that respects the player:** a bobbing quest marker over the next objective (at the screen edge when it is far, over the right door when it is in another building), a MAP tab with a rendered overview of Clarksville, "you are here" and the next objective, story beats that start when they are ready instead of waiting for a door. The marker can be switched off in SYSTEM.
- **A living town:** cars that drive on the right, brake for anyone in the road and honk when you make them wait; birds; rain (with sound) on roof-leak days; footsteps; every character has a dialogue voice pitch.
- **16 awards and a Pastor Report Card** (Listening, Resolve, Neighborliness, Shepherding, Self-care, Language) graded from how you actually played, shown in the credits.
- Two endings with a cinematic and credits that reflect who became your ally along the way.
- Original code-drawn pixel art, synthesized chiptune music and sound effects, on-screen phone controls, versioned local saves.

## Personalize it

Everything is data; the engine doesn't care whose church it is.

| What | Where |
|---|---|
| Names, title, church, town, sayings, coffee order, event name | `src/config/personal.ts` |
| Dialogue, quests flow, random events, ending script & credits | `src/data/dialogue.ts` |
| Journal titles, objectives, resource help text | `src/data/quests.ts` |
| Encounters (opponents, tells, effectiveness, moves) | `src/data/encounters.ts` |
| Money, thresholds, costs, difficulty | `src/data/balance.ts` |
| Awards and report-card grading | `src/data/awards.ts` |
| Where the quest marker points (`questTarget`) | `src/data/quests.ts` |
| Who exists and what they look like (hair, beard, cap, glasses, colors) | `src/data/cast.ts` |
| Maps, buildings, NPC positions, doors, interactables | `src/data/maps.ts` |
| Tiles (16x16) | `src/art/tiles.ts` |
| Character sprites / portraits (templates + overlays) | `src/art/characters.ts`, `src/art/portraits.ts` |
| Music & sound | `src/engine/audio.ts` |

Art is written as text grids (one character per pixel) so it needs no tools to edit. To swap in real PNGs later, load them in `src/scenes/BootScene.ts` under the same texture keys (`tiles`, `char-<id>`, `portrait-<id>-<mood>`).

## Tests

```
npm run build        # type-check + production build
npm test             # art validation, encounter balance simulation, full browser playthrough (both endings), mobile checks
```

The browser tests use the bundled Playwright + Chromium; see `tests/`. Visual spot checks: `node tests/serviceshot.mjs` (Sunday service) and `node tests/worldshot.mjs` (marker, map tab, cars, rain, birds) write screenshots to `tests/out/`.

## Deploy

- **GitHub Pages:** the workflow in `.github/workflows/deploy-pages.yml` builds and publishes `dist/` on every push to `main`. One-time setup: repo *Settings → Pages → Source: GitHub Actions*. The game is then at `https://<user>.github.io/<repo>/`.
- **Anywhere else:** run `npm run build` and upload `dist/`. Paths are relative, so it works from any subfolder.

## Link previews

`public/og.png` is the title screen captured as a 1200x630 image, and `index.html` carries Open Graph / Twitter meta tags pointing at `https://timnoose.github.io/timscoolapp/og.png`. If you host the game somewhere else, change that URL in `index.html` (two places) so text messages and social apps show the card. Regenerate the image after changing the title screen with `node tests/og.mjs` (needs a built `dist/`).

## Known limitations

- Art is deliberately simple code-drawn pixel art (no image-generation tools were used).
- Music is synthesized; there are no recorded tracks.
- Saves live in the browser's localStorage (per device/browser).
