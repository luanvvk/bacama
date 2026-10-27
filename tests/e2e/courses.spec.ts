import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test('a signed-out visitor sees the log-in CTA instead of an enrol button', async ({ page }) => {
  await page.goto('/courses/latte-art');

  const cta = page.getByRole('link', { name: 'Đăng nhập để đăng ký' });
  await expect(cta).toHaveAttribute('href', '/login');
});

test('a guest can watch the free lesson but is sent back from a paid one', async ({ page }) => {
  await page.goto('/learn');

  await expect(page).toHaveURL(/\/learn\/[^/]+\/[^/]+$/);
  await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/"]')).toBeVisible();

  await expect(page.getByLabel('Đã khóa').first()).toBeVisible();

  // The next lesson after the free one is a paid lesson.
  await page.getByRole('link', { name: 'Bài sau' }).click();

  await expect(page).toHaveURL(/\/courses\/latte-art\?locked=1$/);
  await expect(page.getByRole('status').filter({ hasText: 'đã đăng ký' })).toBeVisible();
});
