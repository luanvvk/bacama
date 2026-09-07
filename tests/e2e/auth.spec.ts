import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test.describe('Clerk authentication UI', () => {
  test('login keeps the Bacama form and exposes password recovery', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled();

    await page.getByRole('button', { name: 'Forgot your password?' }).click();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send reset code' })).toBeVisible();
  });

  test('registration keeps the Bacama form and exposes email verification state', async ({
    page,
  }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('signed-out account menu retains the Bacama dropdown', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop', 'Desktop-only account menu');

    await page.goto('/');

    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('menuitem', { name: 'Sign in / Create account' })).toBeVisible();
  });
});
