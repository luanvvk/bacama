import { prisma } from '@/lib/prisma';

export type RateLimit = { max: number; windowMs: number };

/**
 * Database-backed failure counter (no external account needed). Callers check
 * before doing the guarded work and record a hit only when it fails.
 * Returns `retryAfterSeconds` when `max` hits already landed inside the window.
 */
export const checkRateLimit = async (
  key: string,
  { max, windowMs }: RateLimit,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> => {
  const since = new Date(Date.now() - windowMs);
  const hits = await prisma.rateLimitHit.findMany({
    where: { key, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
    take: max,
  });

  if (hits.length < max) {
    return { allowed: true };
  }

  const retryAt = hits[0].createdAt.getTime() + windowMs;
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((retryAt - Date.now()) / 1000)),
  };
};

export const recordRateLimitHit = async (key: string) => {
  await prisma.rateLimitHit.create({ data: { key } });
};
