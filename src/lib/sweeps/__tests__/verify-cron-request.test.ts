/** @jest-environment node */
import { isAuthorizedCronRequest } from '../verify-cron-request';

const requestWith = (authorization?: string) =>
  new Request('http://localhost/api/cron/x', {
    headers: authorization ? { authorization } : {},
  });

const original = process.env.CRON_SECRET;

afterEach(() => {
  if (original === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = original;
});

describe('isAuthorizedCronRequest', () => {
  it('accepts the matching bearer secret', () => {
    process.env.CRON_SECRET = 's3cret';
    expect(isAuthorizedCronRequest(requestWith('Bearer s3cret'))).toBe(true);
  });

  it('rejects a missing header', () => {
    process.env.CRON_SECRET = 's3cret';
    expect(isAuthorizedCronRequest(requestWith())).toBe(false);
  });

  it('rejects a wrong secret, including one of a different length', () => {
    process.env.CRON_SECRET = 's3cret';
    expect(isAuthorizedCronRequest(requestWith('Bearer s3creT'))).toBe(false);
    expect(isAuthorizedCronRequest(requestWith('Bearer short'))).toBe(false);
  });

  it('rejects everything when CRON_SECRET is unset', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCronRequest(requestWith('Bearer undefined'))).toBe(false);
    expect(isAuthorizedCronRequest(requestWith('Bearer '))).toBe(false);
  });
});
