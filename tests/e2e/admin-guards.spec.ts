import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test.describe('admin guards', () => {
  for (const path of [
    '/admin',
    '/admin/catalog',
    '/admin/catalog/dalat-washed/edit',
    '/admin/menu',
    '/admin/announcements',
    '/admin/students',
    '/admin/staff',
  ]) {
    test(`signed-out visit to ${path} ends on /login`, async ({ page }) => {
      await page.goto(path);

      await expect.poll(() => new URL(page.url()).pathname).toBe('/login');
    });
  }
});
