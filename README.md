# Grove

A focus timer that grows a garden. Every completed focus session grows a plant; the more time you
focus over weeks and months, the larger and richer your garden becomes.

Grove is a free, installable Progressive Web App. There are no ads, no accounts, no tracking and no
paywalled features. Everything stays on your device unless you export it yourself.

## What it does

- **Focus sessions** as a countdown (10 to 180 minutes), Pomodoro rounds, or a stopwatch.
- **Strictness you choose**: Gentle (pauses allowed, plants never die), Standard (15-second grace
  when you leave), Deep focus (5-second grace, hold-to-confirm give up).
- **Plants and biomes**: original SVG species with growth stages; long sessions grow mature and
  ancient variants.
- **A garden that evolves** with your lifetime focus time, from a bare patch to a sanctuary.
- **Dew**, the in-app currency, earned by focusing and spent on species and decorations.
- **Stats**, tags, streaks with streak freezes, achievements, and a session timeline.
- **Export and import** your data as JSON to move between devices.

## Run it locally

Requires Node 22 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit and component tests (Vitest)
npm run lint       # ESLint + Prettier check
npm run build      # type-check and production build into dist/
npm run e2e        # Playwright end-to-end tests (builds in "e2e" mode first)
```

In development you can append `?speed=fast` to the URL to make one minute pass in one second. This
flag is ignored in production builds.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: lint, unit tests, build, end-to-end tests,
then a deploy to GitHub Pages with the official Pages actions. In the repository settings, set
**Pages → Source** to **GitHub Actions** once.

The app is built with `VITE_BASE=/Focus-Garden/` so it works as a project page. If you fork the
repository under another name, change that value in the workflow (or set `VITE_BASE` to `/` for a
user or custom-domain site).

## Add a new species

Species are data. Add an entry to `src/data/species.ts` with an id, name, biome, rarity, unlock
condition, dew cost, flavour text, palette and the art form to draw it with. Nothing else needs to
change: the shop, Seed Book, garden and stats pick it up automatically. See the comments at the top
of that file for the fields and the available art forms.

## Web-platform limits, stated honestly

- **Grove cannot block other apps or websites.** A web page has no such power. Instead, Grove
  notices when you leave (the Page Visibility API and window blur) and, in Standard and Deep focus
  modes, gives you a short grace period to come back before the plant wilts.
- **Timers use wall-clock timestamps**, not tick counting, so they stay correct when the tab is
  throttled or the phone sleeps.
- **Notifications** need your permission and, on iOS, the app must be installed to the home screen.
- **Screen wake lock** is optional and only works in browsers that support the Wake Lock API.

## Project layout

```
src/
  app/            routing, layout, providers
  features/
    timer/        session engine, strictness, visibility handling
    garden/       garden renderer, placement, arrange mode, share image
    collection/   seed book, shop
    stats/        dashboard, charts, timeline
    companion/    character, messages
    settings/     settings, tags, export/import
  data/           species, gardenLevels, achievements, decorations
  art/            SVG components for plants, companion, decorations, terrain
  storage/        IndexedDB access, migrations
  types.ts
public/           icons, manifest assets
docs/             decisions.md, v2-social.md
```

See `docs/decisions.md` for the reasoning behind non-obvious choices and `CREDITS.md` for
third-party licences.
