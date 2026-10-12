import type { Page } from '@playwright/test';

/** Open the app with the dev speed flag (1 minute = 1 second) and dismiss onboarding. */
export async function openApp(page: Page, path = '/'): Promise<void> {
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}speed=fast`);
  // The shell renders only after IndexedDB hydration; onboarding appears with it on first launch.
  await page.locator('main').waitFor();
  const skip = page.getByRole('button', { name: 'Skip' });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await skip.waitFor({ state: 'hidden' });
  }
}

export async function setVisibility(page: Page, state: 'hidden' | 'visible'): Promise<void> {
  await page.evaluate((s) => {
    Object.defineProperty(document, 'visibilityState', { value: s, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, state);
}
