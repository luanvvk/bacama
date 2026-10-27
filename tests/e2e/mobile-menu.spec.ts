import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('closes after a link is tapped', async ({ page }) => {
    await page.goto('/');

    const menu = page.getByRole('dialog');
    await expect(async () => {
      await page.getByRole('button', { name: 'Mở menu' }).click();
      await expect(menu).toBeVisible({ timeout: 1000 });
    }).toPass();

    await menu.locator('nav > a').first().click();

    await expect(menu).toBeHidden();
  });
});
