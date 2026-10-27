/** @jest-environment node */
import {
  createOrderAccessToken,
  orderAccessCookieName,
  verifyOrderAccessToken,
} from './order-access';

beforeAll(() => {
  process.env.CLERK_SECRET_KEY = 'test-secret';
});

describe('order access token', () => {
  it('verifies a token signed for the same ref', () => {
    const token = createOrderAccessToken('BCM-1');
    expect(verifyOrderAccessToken('BCM-1', token)).toBe(true);
  });

  it('rejects a token for another ref, a tampered token, and a missing token', () => {
    const token = createOrderAccessToken('BCM-1');
    expect(verifyOrderAccessToken('BCM-2', token)).toBe(false);
    expect(verifyOrderAccessToken('BCM-1', `${token.slice(0, -1)}0`)).toBe(false);
    expect(verifyOrderAccessToken('BCM-1', 'short')).toBe(false);
    expect(verifyOrderAccessToken('BCM-1', undefined)).toBe(false);
  });

  it('names the cookie per ref', () => {
    expect(orderAccessCookieName('BCM-1')).toBe('bcm_oa_BCM-1');
  });
});
