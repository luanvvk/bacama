import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test.describe('protected routes', () => {
  for (const path of [
    '/me',
    '/me/learning',
    '/account',
    '/account/profile',
    '/admin',
    '/admin/bakery',
  ]) {
    test(`signed-out visit to ${path} ends on /login`, async ({ page }) => {
      await page.goto(path);

      await expect.poll(() => new URL(page.url()).pathname).toBe('/login');
    });
  }
});
