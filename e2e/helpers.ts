import type { Page } from '@playwright/test';

/** Open the app with the dev speed flag (1 minute = 1 second) and dismiss onboarding. */
export async function openApp(page: Page, path = '/'): Promise<void> {
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}speed=fast`);
  // The shell renders only after IndexedDB hydration; onboarding appears with it on first launch.
  await page.locator('main').waitFor();
  const skip = page.getByRole('button', { name: 'Skip', exact: true });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await skip.waitFor({ state: 'hidden' });
  }
  // The guided tour follows onboarding on first launch and jumps to the timer page.
  const skipTour = page.getByRole('button', { name: 'Skip tour' });
  if (
    await skipTour.waitFor({ state: 'visible', timeout: 3000 }).then(
      () => true,
      () => false,
    )
  ) {
    await skipTour.click();
    await skipTour.waitFor({ state: 'hidden' });
    const wanted = path.split('?')[0];
    if (wanted !== '/' && !page.url().endsWith(wanted)) {
      await page.goto(`${path}${path.includes('?') ? '&' : '?'}speed=fast`);
      await page.locator('main').waitFor();
    }
  }
}

export async function setVisibility(page: Page, state: 'hidden' | 'visible'): Promise<void> {
  await page.evaluate((s) => {
    Object.defineProperty(document, 'visibilityState', { value: s, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  }, state);
}
