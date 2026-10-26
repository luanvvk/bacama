import { expect, test } from '@playwright/test';

test('a signed-out visitor sees the log-in CTA instead of an enrol button', async ({ page }) => {
  await page.goto('/courses/latte-art');

  const cta = page.getByRole('link', { name: /đăng nhập/i }).first();
  await expect(cta).toHaveAttribute('href', '/login');
});
