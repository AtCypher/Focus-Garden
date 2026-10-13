import { test, expect } from '@playwright/test';
import { openApp, setVisibility } from './helpers';

test('complete a short session and see the plant in the garden and stats', async ({ page }) => {
  await openApp(page);
  await expect(page.getByRole('heading', { name: 'Plant a seed' })).toBeVisible();
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();

  await expect(page.getByRole('button', { name: /Cancel \(\d+s, no penalty\)/ })).toBeVisible();
  await expect(page.getByText('Fully grown')).toBeVisible({ timeout: 40_000 });
  await expect(page.getByText(/\+\d+ dew/)).toBeVisible();
  await page.getByRole('button', { name: 'Plant another' }).click();

  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByText('1 plant shown')).toBeVisible();
  await expect(page.locator('svg[role=img] g[role=button][aria-label^="Sun Daisy"]')).toHaveCount(
    1,
  );

  await page.getByRole('link', { name: 'Stats' }).click();
  await expect(page.getByLabel('Totals')).toContainText('15m');
  await expect(page.getByText('First seed', { exact: true })).toBeVisible();
});

test('leaving the page in Standard mode wilts the plant after the grace period', async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole('button', { name: '60', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  // Past the 10-second cancel window.
  await expect(page.getByRole('button', { name: 'Give up' })).toBeVisible({ timeout: 15_000 });

  await setVisibility(page, 'hidden');
  await page.waitForTimeout(16_000);
  await setVisibility(page, 'visible');

  await expect(page.getByRole('heading', { name: 'It wilted' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Try 30 minutes/ })).toBeVisible();
  await page.getByRole('button', { name: 'Back to planting' }).click();

  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.locator('svg[role=img] g[role=button][aria-label*="wilted"]')).toHaveCount(1);
});

test('returning within the grace period keeps the plant alive', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: '60', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByRole('button', { name: 'Give up' })).toBeVisible({ timeout: 15_000 });
  await setVisibility(page, 'hidden');
  await expect(page.getByText('Come back! Your plant is waiting.')).toBeVisible();
  await setVisibility(page, 'visible');
  await expect(page.getByText('Standard', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Give up' })).toBeVisible();
});
