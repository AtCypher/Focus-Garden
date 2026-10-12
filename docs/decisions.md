# Decisions

Choices made where the brief was ambiguous or collided with a technical constraint. Newest last.

## Phase 1: scaffold

- **Tailwind CSS 4 instead of 3.** Tailwind 4 is the current major and configures itself in CSS
  (`@theme` in `src/app/styles.css`) through the official Vite plugin. There is no
  `tailwind.config.js`; design tokens live in the stylesheet.
- **Vite 8 / Vitest 5 / ESLint 9.** Latest stable at scaffold time. ESLint is pinned to 9 because
  `eslint-plugin-jsx-a11y` does not yet declare ESLint 10 as a peer.
- **React 18.3** as the brief asks. Everything used is compatible with React 19, so upgrading later is
  a one-line change.
- **Base path.** The repository is `AtCypher/Focus-Garden`, so the GitHub Pages project URL is
  `/Focus-Garden/`. `vite.config.ts` reads `VITE_BASE` and defaults to `/Focus-Garden/` under
  GitHub Actions and `/` locally. The deploy workflow sets it explicitly.
- **Deep links on GitHub Pages.** Pages has no SPA rewrite rule, so the build copies `index.html` to
  `404.html`. Combined with the service worker's navigation fallback this keeps routes like
  `/stats` loadable directly and offline.
- **One workflow, three jobs.** `check` (lint, unit tests, build) and `e2e` run on every PR and push
  to `main`; `deploy` runs only on `main` after both pass, using the official GitHub Pages actions
  (no `gh-pages` branch).
- **Dev speed flag.** The "1 minute = 1 second" flag for demos and E2E is only honoured when
  `VITE_ALLOW_SPEED_FLAG=true`, which is set in `.env.development` and `.env.e2e`. Playwright builds
  with `--mode e2e`, so the production bundle never contains the shortcut.
- **Fonts.** System font stack only, so the app makes no third-party requests at all.

## Phase 2: timer engine

- **One engine block = one plant.** The pure engine (`src/features/timer/engine.ts`) models a single
  focus block. Pomodoro breaks are a separate, simpler timer (`pomodoro.ts`); each focus block
  produces its own session and plant, as the brief asks.
- **Completion beats wilting.** If the user leaves and the plant finishes growing before the grace
  period ends, the session counts as completed. The plant was done; it should not die afterwards.
- **Giving up inside the cancel window is a free cancel**, whatever the strictness.
- **Giving up in Gentle mode still wilts the plant.** "Plants never die" in Gentle refers to leaving
  the app; an explicit give-up is the user's choice and is recorded honestly.
- **A pause longer than 5 minutes auto-resumes at the 5-minute mark**, so a forgotten pause in
  Gentle mode cannot stall the timer forever and the credited time stays honest.
- **Stopwatch cap of 180 minutes** (matches the countdown maximum); the session auto-completes there.
- **Window blur counts as leaving** in addition to `visibilitychange`, as the brief suggests. On
  desktop this means clicking into another window starts the grace period. The 15-second grace
  absorbs accidental clicks.
- **Reload survives a session.** A snapshot of the running block is kept in localStorage along with
  the time the page was hidden; on reload the engine replays hide/show, so a refresh inside the
  grace period keeps the plant and a long absence wilts it, exactly as if the tab had stayed open.
- **Hold-to-confirm is pointer-only.** Keyboard and screen-reader users get a confirmation dialog
  instead of a timed hold, which would otherwise be inaccessible.
- **Timer announcements** go to an `aria-live` region once per minute, not every second.
