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
