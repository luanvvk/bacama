import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test('a signed-out visitor sees the log-in CTA instead of an enrol button', async ({ page }) => {
  await page.goto('/courses/latte-art');

  const cta = page.getByRole('link', { name: 'Đăng nhập để đăng ký' });
  await expect(cta).toHaveAttribute('href', '/login');
});
