import { expect, test } from '@playwright/test';

const publicRoutes = [
  ['/', 'Roasted by hand,'],
  ['/shop', 'Coffee & Bakery'],
  ['/courses', 'All courses'],
  ['/story', 'One kitchen, one oven, one family.'],
  ['/login', 'Welcome back'],
  ['/register', 'Create your account'],
] as const;

const adminRoutes = [
  ['/admin', 'Today at a glance'],
  ['/admin/catalog', 'Coffee & blends'],
  ['/admin/bakery', 'Bakery'],
  ['/admin/menu', 'Café menu'],
  ['/admin/orders', 'Online orders'],
  ['/admin/shipments', 'Shipments'],
  ['/admin/announcements', 'Announcements'],
  ['/admin/sites', 'Sites'],
  ['/admin/courses', 'Courses'],
  ['/admin/staff', 'Staff & permissions'],
  ['/admin/students', 'Students'],
] as const;

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test.describe('public routes', () => {
  for (const [route, heading] of publicRoutes) {
    test(`${route} renders ${heading}`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main').getByText(heading, { exact: false }).first()).toBeVisible();
    });
  }
});

test.describe('admin routes', () => {
  for (const [route, heading] of adminRoutes) {
    test(`${route} renders ${heading}`, async ({ page }) => {
      const response = await page.goto(route);

      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('main').getByText(heading, { exact: false }).first()).toBeVisible();
    });
  }
});

test('catalog search filters products', async ({ page }) => {
  await page.goto('/admin/catalog');
  const search = page.getByRole('textbox', { name: 'Search catalogue' });

  await search.fill('Sơn La');

  await expect(page.locator('main').getByText('Sơn La Natural', { exact: true })).toBeVisible();
  await expect(page.locator('main').getByText('Đà Lạt Washed', { exact: true })).not.toBeVisible();
});

test('mobile admin menu opens and navigates', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Mobile-only interaction');

  await page.goto('/admin');

  await page.getByRole('button', { name: 'Open admin menu' }).click();
  const navigation = page.getByRole('navigation', { name: 'Admin navigation' });

  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Students' }).click();
  await expect(page).toHaveURL(/\/admin\/students$/);
});

test('mobile storefront menu opens', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile', 'Mobile-only interaction');

  await page.goto('/story');

  await page.getByRole('button', { name: 'Open menu' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Our family', { exact: true })).toBeVisible();
});
