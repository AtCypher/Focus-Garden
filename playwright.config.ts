import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against a build made in "e2e" mode (see .env.e2e). That mode enables the
 * dev-only speed flag (1 minute = 1 second) so a "10 minute" session takes 10 seconds.
 * The production build never honours the flag.
 */
const port = 4173;
const base = '/';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}${base}`,
    trace: 'retain-on-failure',
    permissions: ['notifications'],
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // VITE_BASE must reach both the build and the preview server: on GitHub Actions the config
    // otherwise defaults to the Pages base (/Focus-Garden/) and the app is served at the wrong path.
    command: `npx vite build --mode e2e && npx vite preview --port ${port} --strictPort`,
    env: { VITE_BASE: base },
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
