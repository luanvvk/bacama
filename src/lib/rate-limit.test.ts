/** @jest-environment node */
import { hitRateLimit, releaseRateLimitHit } from './rate-limit';

const findMany = jest.fn();
const create = jest.fn();
const deleteMany = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    rateLimitHit: {
      findMany: (...args: unknown[]) => findMany(...args),
      create: (...args: unknown[]) => create(...args),
      deleteMany: (...args: unknown[]) => deleteMany(...args),
    },
  },
}));

const limit = { max: 3, windowMs: 60_000 };

describe('hitRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    create.mockResolvedValue({ id: 'hit-1' });
  });

  it('records the hit and allows while the count is within max', async () => {
    findMany.mockResolvedValue([{ createdAt: new Date() }, { createdAt: new Date() }]);
    expect(await hitRateLimit('k', limit)).toEqual({ allowed: true, hitId: 'hit-1' });
    expect(create).toHaveBeenCalledWith({ data: { key: 'k' }, select: { id: true } });
  });

  it('allows exactly max hits', async () => {
    findMany.mockResolvedValue([1, 2, 3].map(() => ({ createdAt: new Date() })));
    expect((await hitRateLimit('k', limit)).allowed).toBe(true);
  });

  it('blocks past max and reports when the oldest hit leaves the window', async () => {
    findMany.mockResolvedValue([
      { createdAt: new Date(Date.now() - 20_000) },
      ...[1, 2, 3].map(() => ({ createdAt: new Date() })),
    ]);

    const result = await hitRateLimit('k', limit);

    expect(result.allowed).toBe(false);
    const seconds = (result as { retryAfterSeconds: number }).retryAfterSeconds;
    expect(seconds).toBeGreaterThanOrEqual(39);
    expect(seconds).toBeLessThanOrEqual(40);
  });

  it('prunes expired rows for the key', async () => {
    findMany.mockResolvedValue([]);
    await hitRateLimit('k', limit);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { key: 'k', createdAt: { lt: expect.any(Date) } },
    });
  });

  it('releases hits by id', async () => {
    await releaseRateLimitHit(['a', 'b']);
    expect(deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['a', 'b'] } } });
  });
});
