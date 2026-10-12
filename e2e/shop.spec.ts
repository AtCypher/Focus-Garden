import { test, expect } from '@playwright/test';
import { openApp } from './helpers';

test('earn dew and buy a species, which then appears in the planting list', async ({ page }) => {
  test.setTimeout(120_000);
  await openApp(page);
  await page.getByRole('button', { name: '45', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByText('Fully grown')).toBeVisible({ timeout: 70_000 });
  await page.getByRole('button', { name: 'Plant another' }).click();

  await page.getByRole('link', { name: 'Seed Book' }).click();
  await expect(page.getByText('3 of 24 species collected.')).toBeVisible();
  const buy = page.getByRole('button', { name: 'Buy Field Poppy for 40 dew' });
  await expect(buy).toBeEnabled();
  await buy.click();
  await expect(page.getByText('Field Poppy added to your seeds.')).toBeVisible();
  await expect(page.getByText('4 of 24 species collected.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buy Field Poppy for 40 dew' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Timer' }).click();
  await expect(page.locator('#species')).toContainText('Field Poppy');
});
