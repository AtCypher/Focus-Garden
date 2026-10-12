import { test, expect } from '@playwright/test';
import { openApp } from './helpers';
import fs from 'node:fs';

test('export a backup, reset, and import it back', async ({ page }, testInfo) => {
  await openApp(page);
  await page.getByRole('button', { name: '15', exact: true }).click();
  await page.getByRole('button', { name: 'Plant' }).click();
  await expect(page.getByText('Fully grown')).toBeVisible({ timeout: 40_000 });
  await page.getByRole('button', { name: 'Plant another' }).click();

  await page.getByRole('link', { name: 'Settings' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export backup (JSON)' }).click(),
  ]);
  const file = testInfo.outputPath('backup.json');
  await download.saveAs(file);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(json.app).toBe('grove');
  expect(json.sessions).toHaveLength(1);
  expect(json.plants).toHaveLength(1);

  await page.getByRole('button', { name: 'Reset everything' }).click();
  await page.getByRole('button', { name: 'Delete everything' }).click();
  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByText('Nothing planted yet.')).toBeVisible();

  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByLabel('Choose a Grove backup file').setInputFiles({
    name: 'junk.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"app":"other"}'),
  });
  await expect(page.getByRole('dialog')).toContainText('cannot be imported');
  await page.getByRole('button', { name: 'OK' }).click();

  await page.getByLabel('Choose a Grove backup file').setInputFiles(file);
  await expect(page.getByRole('dialog')).toContainText('1 sessions');
  await page.getByRole('button', { name: 'Import and replace' }).click();
  await expect(page.getByText('Imported 1 sessions and 1 plants.')).toBeVisible();

  await page.reload();
  await page.getByRole('link', { name: 'Garden' }).click();
  await expect(page.getByText('1 plant shown')).toBeVisible();
});
