import { test, expect } from '@playwright/test';

test('the guided tour runs after onboarding, can be finished, and replays from Settings', async ({
  page,
}) => {
  await page.goto('/?speed=fast');
  await page.locator('main').waitFor();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Welcome to Grove' })).toBeVisible();
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('dialog', { name: 'Make it yours' })).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole('button', { name: 'Start growing' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.reload();
  await page.locator('main').waitFor();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Show the tutorial again' }).click();
  await expect(page.getByRole('dialog', { name: 'Welcome to Grove' })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('button', { name: 'Skip tour' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('the garden shows beds by default and can switch to the map', async ({ page }) => {
  await page.goto('/garden?speed=fast');
  await page.locator('main').waitFor();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByRole('button', { name: 'Skip tour' }).click();
  await expect(page.locator('section[aria-label$=" bed"]')).toHaveCount(3);
  await expect(page.getByText('Nothing here yet').first()).toBeVisible();
  await page.getByText('Map', { exact: true }).click();
  await expect(page.locator('svg[role=img][aria-label*="garden with"]')).toBeVisible();
  await page.reload();
  await page.locator('main').waitFor();
  await expect(page.locator('svg[role=img][aria-label*="garden with"]')).toBeVisible();
});
