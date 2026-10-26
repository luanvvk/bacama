/** @jest-environment node */
jest.mock('@/services/enrollments/release-expired-holds', () => ({
  releaseExpiredHolds: jest.fn(),
}));

import { releaseExpiredHolds } from '@/services/enrollments/release-expired-holds';

import { GET } from '../route';

const mockRelease = releaseExpiredHolds as jest.Mock;

const call = (authorization?: string) =>
  GET(
    new Request('http://localhost/api/cron/release-seat-holds', {
      headers: authorization ? { authorization } : {},
    }),
  );

const original = process.env.CRON_SECRET;

beforeEach(() => {
  jest.resetAllMocks();
  process.env.CRON_SECRET = 's3cret';
});

afterAll(() => {
  if (original === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = original;
});

describe('GET /api/cron/release-seat-holds', () => {
  it('returns 401 with no database call when the header is missing', async () => {
    expect((await call()).status).toBe(401);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('returns 401 with no database call when the secret is wrong', async () => {
    expect((await call('Bearer nope')).status).toBe(401);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('returns 401 with no database call when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    expect((await call('Bearer undefined')).status).toBe(401);
    expect(mockRelease).not.toHaveBeenCalled();
  });

  it('runs the sweep with the right secret', async () => {
    mockRelease.mockResolvedValue({ released: 3 });
    const res = await call('Bearer s3cret');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ released: 3 });
  });
});
