import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openApp } from './helpers';

const pages = ['/', '/garden', '/seeds', '/stats', '/settings'];

for (const path of pages) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await openApp(page, path);
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious,
      JSON.stringify(
        serious.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.html).slice(0, 3) })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}
