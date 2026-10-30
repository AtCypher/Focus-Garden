import { test, expect } from '@playwright/test';
import { openApp } from './helpers';

test('daily visit, intent, tasks and a one-tap preset', async ({ page }) => {
  await openApp(page);
  // Daily visit pays dew once.
  await expect(page.getByLabel('Daily visit')).toBeVisible();
  await page.getByRole('button', { name: /^Water \(\+5\)/ }).click();
  await expect(page.getByLabel('Daily visit')).toHaveCount(0);
  await expect(page.getByLabel('5 dew')).toBeVisible();

  // Intent and a task.
  await page.getByLabel(/What are you working on/).fill('Chapter 3 notes');
  await page.getByLabel('New task').fill('Read section 3.1');
  await page.getByLabel('New task').press('Enter');
  await expect(page.getByRole('checkbox', { name: 'Read section 3.1' })).toBeVisible();

  // Save a preset, then start it from the URL.
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.getByRole('button', { name: /Save these settings as a one-tap preset/ }).click();
  await page.getByLabel('Preset name').fill('Quick fifteen');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Quick fifteen' })).toBeVisible();

  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByText('Chapter 3 notes')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Read section 3.1' }).check();
  await expect(page.getByText('Fully grown')).toBeVisible({ timeout: 40_000 });
  await page.getByRole('button', { name: 'Plant another' }).click();

  await page.goto('/?plant=Quick%20fifteen');
  await expect(page.getByRole('button', { name: /Cancel \(\d+s, no penalty\)/ })).toBeVisible();
  await page.getByRole('button', { name: /Cancel/ }).click();

  // The Seed Book has the new tabs.
  await page.getByRole('link', { name: 'Seed Book' }).click();
  await page.getByText('Finds', { exact: true }).click();
  await expect(page.getByText(/shelf/)).toBeVisible();
  await page.getByText('Challenges', { exact: true }).click();
  await page.getByRole('button', { name: 'Start' }).first().click();
  await expect(page.getByText('Day 1 of 7')).toBeVisible();
});
