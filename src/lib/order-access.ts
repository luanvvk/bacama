import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_PREFIX = 'bcm_oa_';
export const ORDER_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const sign = (ref: string) => {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('CLERK_SECRET_KEY is required to sign order access cookies');
  return createHmac('sha256', secret).update(`order-access:${ref}`).digest('hex');
};

/** Per-order cookie, so a second order doesn't overwrite proof for the first. */
export const orderAccessCookieName = (ref: string) => `${COOKIE_PREFIX}${ref}`;

export const createOrderAccessToken = (ref: string) => sign(ref);

export const verifyOrderAccessToken = (ref: string, token: string | undefined): boolean => {
  if (!token) return false;
  const expected = Buffer.from(sign(ref));
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};
