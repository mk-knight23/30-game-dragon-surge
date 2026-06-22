# Dragon Surge

A neon-arcade **endless runner** built with Vue 3 and HTML Canvas. Pilot a
glowing dragon through an infinite volcanic gauntlet — jump and double-jump
over magma obstacles, collect coins, grab power-ups, and chase a high score
that grows harder the longer you survive.

## Gameplay

- **Endless runner** — the world scrolls toward you; you never reach an end,
  only a higher score.
- **Jump & double-jump** — a second jump in mid-air clears taller hazards.
- **Coins** — collect floating coins for score bonuses.
- **Power-ups**
  - **Shield** — absorbs one otherwise-fatal hit.
  - **Coin magnet** — pulls nearby coins toward you for a few seconds.
- **Difficulty ramp** — scroll speed and obstacle frequency rise smoothly with
  your score on a fair, diminishing-returns curve that approaches a cap rather
  than spiking.
- **Juice** — particle bursts on coin pickups, near-misses, and shield blocks;
  parallax mountains and drifting embers give the scene depth.
- **Persistent high score** — your best run is saved in `localStorage` and shown
  on the start and game-over screens.

## Controls

| Action | Input |
|--------|-------|
| Jump / double-jump | `Space`, `↑`, `W`, **tap or click anywhere on the canvas**, or the on-screen button (mobile) |
| Pause / resume | `Esc` |
| Toggle sound | `M` |
| Settings | gear icon in the top bar |

The canvas scales responsively, and the whole game is playable with a single
tap on touch devices.

## Tech Stack

- **Vue 3** (`<script setup>`, Composition API)
- **HTML5 Canvas** for the render loop (`requestAnimationFrame`)
- **Pinia** for game/settings state
- **Vite 6** build tooling
- **Tailwind CSS 4** for UI chrome
- **Vitest** for unit tests
- **TypeScript** throughout

The game simulation lives in a pure, framework-free engine
(`src/game/engine.ts` + `src/game/difficulty.ts`) so it can be unit-tested
without a DOM. `src/App.vue` is a thin renderer that drives the engine each
frame and paints the canvas.

## Run, Build, Test

```bash
npm install      # install dependencies

npm run dev      # start the dev server (http://localhost:3002)
npm run build    # production build to dist/
npm run preview  # preview the production build

npm test         # run the Vitest unit suite once
npm run test:watch  # watch mode
npx vue-tsc -b   # type-check
```

### Tests

The suite covers the core mechanics:

- jump / double-jump state and gravity/landing reset
- obstacle collision detection (and shield absorption)
- coin scoring and magnet pull
- difficulty progression (speed and spawn-rate curves, level thresholds)

## Project Structure

```
src/
├── App.vue                 # root component + canvas render loop
├── game/
│   ├── engine.ts           # pure game simulation (jump, physics, collisions, power-ups)
│   ├── engine.test.ts      # engine unit tests
│   ├── difficulty.ts       # speed / spawn-rate / level curves
│   └── difficulty.test.ts  # difficulty unit tests
├── stores/
│   ├── game.ts             # game state, score, high score, run history
│   └── settings.ts         # sound / particles / theme prefs
├── composables/
│   ├── useKeyboardControls.ts
│   └── useAudio.ts
├── components/ui/SettingsPanel.vue
├── views/                  # Stats / Achievements (router views)
└── utils/constants.ts      # tunable game constants
```

## Deploy

The project is a static SPA — any static host works. A `vercel.json` is
included:

```bash
npm run build        # outputs static assets to dist/
```

Deploy `dist/` to Vercel, Netlify, GitHub Pages, or any static file host. On
Vercel, the included config serves the SPA directly.

## License

MIT — see [LICENSE](LICENSE).

© 2026 Made by MK — Built by Musharraf Kazi.
