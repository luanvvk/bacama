import { expect, test } from '@playwright/test';

const routes = ['/shop', '/bakery', '/checkout'] as const;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

for (const route of routes) {
  test(`${route} has one h1 and no unnamed controls`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);

    const unnamed = await page
      .locator('main')
      .locator('button, [role="checkbox"], input:not([type="hidden"])')
      .evaluateAll((els) =>
        els
          .filter((el) => {
            const labelled =
              el.getAttribute('aria-label') ||
              el.getAttribute('aria-labelledby') ||
              (el.textContent ?? '').trim() ||
              (el as HTMLInputElement).labels?.length ||
              (el.id && document.querySelector(`label[for="${el.id}"]`));
            return !labelled;
          })
          .map((el) => el.outerHTML.slice(0, 120)),
      );
    expect(unnamed).toEqual([]);
  });
}
