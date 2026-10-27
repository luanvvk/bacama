import { getSafeRedirectPath } from '../redirect';

describe('getSafeRedirectPath', () => {
  it('keeps same-origin paths', () => {
    expect(getSafeRedirectPath('/courses/latte-art?x=1')).toBe('/courses/latte-art?x=1');
  });

  it('falls back to /me when missing', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/me');
  });

  it.each([
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/\r/evil.com',
    'javascript:alert(1)',
    'me',
  ])('rejects %j', (target) => {
    expect(getSafeRedirectPath(target)).toBe('/me');
  });

  it('uses the first value of a repeated param', () => {
    expect(getSafeRedirectPath(['/a', '//evil.com'])).toBe('/a');
  });
});
