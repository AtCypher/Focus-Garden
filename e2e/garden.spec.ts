import { test, expect } from '@playwright/test';
import { openApp } from './helpers';

test('arrange by tapping a plant then a free tile, and compost a wilted plant', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await openApp(page);
  // One healthy plant.
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByText('Fully grown')).toBeVisible({ timeout: 40_000 });
  await page.getByRole('button', { name: 'Plant another' }).click();
  // One wilted plant.
  await page.getByRole('button', { name: '60', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByRole('button', { name: 'Give up' })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Give up' }).click();
  await expect(page.getByText('It wilted')).toBeVisible();
  await page.getByRole('button', { name: 'Back to planting' }).click();

  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByText('2 plants shown')).toBeVisible();

  // Arrange: pick up the healthy daisy, drop it on a free tile.
  await page.getByRole('button', { name: 'Arrange' }).click();
  const healthy = page.locator('svg[role=img] g[role=button][aria-label^="Sun Daisy, grown"]');
  await healthy.click();
  await expect(page.getByText(/Picked up/)).toBeVisible();
  const freeTiles = page.locator('svg[role=img] path[role=button]');
  await expect(freeTiles.first()).toBeVisible();
  await freeTiles.last().dispatchEvent('click');
  await expect(page.getByText('Moved.')).toBeVisible();
  // Free tiles are only offered while something is picked up.
  await expect(freeTiles).toHaveCount(0);
  await page.getByRole('button', { name: 'Done arranging' }).click();

  // Compost the wilted one.
  await page.getByRole('button', { name: /Compost wilted \(1\)/ }).click();
  await page.getByRole('button', { name: 'Compost them' }).click();
  await expect(page.getByText('1 plant shown')).toBeVisible();
  await expect(page.locator('svg[role=img] g[role=button][aria-label*="wilted"]')).toHaveCount(0);

  // The wilted session is still in the stats timeline.
  await page.getByRole('link', { name: 'Stats' }).click();
  await expect(page.getByText(/wilted after/)).toBeVisible();
});
