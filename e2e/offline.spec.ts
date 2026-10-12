import { test, expect } from '@playwright/test';
import { openApp } from './helpers';

test('the app loads offline after the first visit (service worker)', async ({ page, context }) => {
  await openApp(page);
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  // Give the service worker a moment to finish precaching.
  await page.waitForTimeout(1500);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Plant a seed' })).toBeVisible();
  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Patch');
  await context.setOffline(false);
});
