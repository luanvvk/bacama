import { expect, test } from '@playwright/test';

const SAMPLE = 'Hương vị nghèo — chưa từng hứa hẹn ế ệ ữ ợ ằ ẵ Đ';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('bacama-entrance-seen', '1'));
});

test('Vietnamese subset loads for both fonts', async ({ page }, testInfo) => {
  await page.goto('/');

  await page.evaluate((sample) => {
    for (const family of ['--font-heading', '--font-sans']) {
      const p = document.createElement('p');
      p.className = 'font-probe';
      p.style.cssText = `font-family: var(${family}); font-size: 28px; font-weight: 600; padding: 8px`;
      p.textContent = sample;
      document.body.prepend(p);
    }
  }, SAMPLE);
  await page.evaluate(() => document.fonts.ready);

  const faces = await page.evaluate(() =>
    Array.from(document.fonts).map((f) => ({
      family: f.family,
      status: f.status,
      unicodeRange: f.unicodeRange,
    })),
  );

  for (const name of ['Fraunces', 'Be_Vietnam_Pro']) {
    const vietnamese = faces.filter(
      (f) =>
        f.family.replace(/["']/g, '').includes(name) &&
        f.status === 'loaded' &&
        f.unicodeRange.toUpperCase().includes('U+1EA0'),
    );
    expect(vietnamese.length, `${name} Vietnamese face loaded`).toBeGreaterThan(0);
  }

  const probes = page.locator('.font-probe');
  await testInfo.attach('vietnamese-samples', {
    body: await page.screenshot({ clip: await probesBox(probes) }),
    contentType: 'image/png',
  });
});

const probesBox = async (probes: ReturnType<import('@playwright/test').Page['locator']>) => {
  const first = await probes.first().boundingBox();
  const last = await probes.last().boundingBox();
  if (!first || !last) throw new Error('probes not rendered');
  return {
    x: Math.max(0, Math.min(first.x, last.x)),
    y: Math.max(0, first.y),
    width: Math.max(first.width, last.width),
    height: last.y + last.height - first.y,
  };
};
