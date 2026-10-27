/** @jest-environment node */
import { checkRateLimit, recordRateLimitHit } from './rate-limit';

const findMany = jest.fn();
const create = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    rateLimitHit: {
      findMany: (...args: unknown[]) => findMany(...args),
      create: (...args: unknown[]) => create(...args),
    },
  },
}));

const limit = { max: 3, windowMs: 60_000 };

describe('checkRateLimit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('allows while hits are under the max', async () => {
    findMany.mockResolvedValue([{ createdAt: new Date() }]);
    expect(await checkRateLimit('k', limit)).toEqual({ allowed: true });
  });

  it('blocks at the max and reports when the oldest hit leaves the window', async () => {
    const oldest = new Date(Date.now() - 20_000);
    findMany.mockResolvedValue([
      { createdAt: oldest },
      { createdAt: new Date() },
      { createdAt: new Date() },
    ]);

    const result = await checkRateLimit('k', limit);

    expect(result.allowed).toBe(false);
    const seconds = (result as { retryAfterSeconds: number }).retryAfterSeconds;
    expect(seconds).toBeGreaterThanOrEqual(39);
    expect(seconds).toBeLessThanOrEqual(40);
  });

  it('records a hit for the key', async () => {
    await recordRateLimitHit('k');
    expect(create).toHaveBeenCalledWith({ data: { key: 'k' } });
  });
});
