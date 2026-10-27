import { expect, test } from '@playwright/test';

// Creates a real COD order, so it needs a database with at least one bakery
// item in stock. Bakery items are pickup-only, which keeps the form short.
const PHONE = '0905123456';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test('COD checkout lands on the confirmation and the order can be tracked by phone', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/bakery');
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();

  await page.goto('/checkout');
  await page.getByRole('radio', { name: /Thanh toán khi nhận hàng/ }).check();
  await page.getByLabel('Họ và tên').fill('Khách thử nghiệm');
  await page.getByLabel('Số điện thoại').fill(PHONE);
  await page.getByLabel('Email').fill('e2e@example.com');
  await page.getByLabel('Địa chỉ').fill('1 Lý Tự Trọng');
  await page.getByRole('button', { name: 'Đặt đơn · thanh toán khi nhận' }).click();

  // COD has no gateway, so it skips /checkout/pay.
  await expect(page).toHaveURL(/\/checkout\/done\?ref=/);
  await expect(page.getByText('Thanh toán khi nhận').first()).toBeVisible();
  const ref = new URL(page.url()).searchParams.get('ref')!;

  // A guest on a fresh browser context has no access cookie, only ref + phone.
  const guest = await browser.newContext({ baseURL });
  const guestPage = await guest.newPage();
  await guestPage.goto(`/orders/${ref}`);

  await guestPage.getByLabel('Số điện thoại').fill('0912000000');
  await guestPage.getByRole('button', { name: 'Theo dõi đơn hàng' }).click();
  await expect(
    guestPage.getByText('Không tìm thấy đơn hàng khớp với mã đơn và số điện thoại này.'),
  ).toBeVisible();

  await guestPage.getByLabel('Số điện thoại').fill(PHONE);
  await guestPage.getByRole('button', { name: 'Theo dõi đơn hàng' }).click();
  await expect(guestPage.getByText(`Mã đơn · ${ref}`)).toBeVisible();
  await guest.close();
});
