# Grove

A focus timer that grows a garden. Every completed focus session grows a plant; the more time you
focus over weeks and months, the larger and richer your garden becomes.

Grove is a free, installable Progressive Web App. There are no ads, no accounts, no tracking and no
paywalled features. Everything stays on your device unless you export it yourself.

## What it does

- **Focus sessions** as a countdown (10 to 180 minutes), Pomodoro rounds with breaks, or a stopwatch.
  The first 10 seconds of any session can be cancelled for free.
- **Strictness you choose**: Gentle (pauses allowed, plants never die), Standard (15-second grace
  when you leave), Deep focus (5-second grace, hold-to-confirm give up). A "leaving the app or locking my
  phone is allowed" option keeps any strictness from wilting when you lock your phone or switch apps.
- **24 original plant species** across seven biomes, each drawn as parametric SVG with seed, sprout,
  sapling and full stages plus a wilted state. Sessions of 60 minutes or more grow mature variants;
  120 minutes or more grow ancient ones with a soft glow.
- **A companion**, Pip (rename it), who waters, hums and dozes beside your plant, and is kind rather
  than scolding when something wilts.
- **A garden that evolves** with lifetime focus time through seven levels, from a bare patch to a
  night-time sanctuary with fireflies. Biomes start grey and regain colour as they fill. Isometric
  view with pan and pinch-zoom, Today/Week/Month/Year/All views, plant details with notes, an
  arrange mode, day/night and seasonal tints, and a shareable PNG.
- **Dew**, the in-app currency: 1 per focused minute with bonuses for stricter modes and the first
  session of the day. Spend it on species, decorations and companion outfits in the Seed Book.
- **Stats**: dashboard, charts by day, tag and hour, a daily goal, streaks with earned streak
  freezes, 20 achievements and a session timeline. Tags are yours to define.
- **Sounds**: rain, forest, café, stream and brown noise, synthesised on the device, plus a chime.
- **Light and dark themes**, reduced-motion support, keyboard access, screen-reader labels.
- **Export and import** your data as JSON to move between devices.

## Run it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit and component tests (Vitest)
npm run lint       # ESLint + Prettier check
npm run build      # type-check and production build into dist/
npm run e2e        # Playwright end-to-end and accessibility tests (builds in "e2e" mode first)
```

In development you can append `?speed=fast` to the URL to make one minute pass in one second
(`?speed=normal` turns it off). The flag is ignored in production builds. A dev-only `/gallery`
route shows every species at every stage and every companion mood.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: lint, unit tests, build, end-to-end tests,
then a deploy to GitHub Pages with the official Pages actions. In the repository settings, set
**Pages → Source** to **GitHub Actions** once.

The app is built with `VITE_BASE=/Focus-Garden/` so it works as a project page. If you fork the
repository under another name, change that value in the workflow (or set `VITE_BASE` to `/` for a
user or custom-domain site).

## Add a new species

Species are data. Add an entry to `src/data/species.ts` with an id, name, biome, rarity, unlock
condition, dew cost, flavour text, palette and the art form to draw it with (`tree`, `flower`,
`shrub`, `cactus`, `mushroom` or `fern`, each with a few shape parameters documented at the top of
that file). Nothing else needs to change: the shop, Seed Book, garden, planting list and stats pick
it up automatically. Open `/gallery` in development to check how it looks at every stage.

To add a new art form, write a renderer in `src/art/plants/` that takes `FormProps` and register
it in `src/art/PlantArt.tsx`.

## Tune the garden

Level thresholds, grid sizes and scenery live in `src/data/gardenLevels.ts`; biome unlock levels in
`src/data/biomes.ts`; dew rates, grace periods and other rules in `src/features/timer/rules.ts`;
decorations and outfits in `src/data/`.

## Web-platform limits, stated honestly

- **Grove cannot block other apps or websites.** A web page has no such power. Instead, Grove
  notices when you leave (the Page Visibility API and window blur) and, in Standard and Deep focus
  modes, gives you a short grace period to come back before the plant wilts.
- **Timers use wall-clock timestamps**, not tick counting, so they stay correct when the tab is
  throttled or the phone sleeps. A running session also survives a page reload.
- **Notifications** need your permission and, on iOS, the app must be installed to the home screen.
- **Screen wake lock** is optional and only works in browsers that support the Wake Lock API.

## Project layout

```
src/
  app/            routing, layout, stores, shared UI, onboarding
  features/
    timer/        session engine, rules, store, visibility controller, audio, timer screens
    garden/       levels and layout logic, SVG scene, pan/zoom, periods, share image
    collection/   unlock logic, Seed Book and shops
    stats/        aggregation, streaks, achievements, stats page
    companion/    message bank, companion panel
    settings/     settings page, tags, export/import
  data/           species, biomes, gardenLevels, achievements, decorations, outfits, defaults
  art/            SVG renderers for plants, companion, decorations, scenery
  storage/        IndexedDB schema and migrations, repository, export/import
  types.ts
public/           icons, manifest assets
docs/             decisions.md, v2-social.md
e2e/              Playwright flows and axe accessibility scans
```

See `docs/decisions.md` for the reasoning behind non-obvious choices, `docs/v2-social.md` for the
planned "Focus together" feature, and `CREDITS.md` for third-party licences.
