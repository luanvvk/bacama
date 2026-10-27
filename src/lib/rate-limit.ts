import { prisma } from '@/lib/prisma';

export type RateLimit = { max: number; windowMs: number };

export type RateLimitHit =
  { allowed: true; hitId: string } | { allowed: false; hitId: string; retryAfterSeconds: number };

/**
 * Database-backed attempt counter (no external account needed). The hit is
 * written before counting so parallel requests cannot all slip under `max`;
 * call `releaseRateLimitHit` when the attempt turns out to be fine so only
 * failures keep counting. Expired rows for the key are pruned on each write.
 */
export const hitRateLimit = async (
  key: string,
  { max, windowMs }: RateLimit,
): Promise<RateLimitHit> => {
  const since = new Date(Date.now() - windowMs);
  const [, hit] = await Promise.all([
    prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: since } } }),
    prisma.rateLimitHit.create({ data: { key }, select: { id: true } }),
  ]);
  const inWindow = await prisma.rateLimitHit.findMany({
    where: { key, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
    take: max + 1,
  });

  if (inWindow.length <= max) {
    return { allowed: true, hitId: hit.id };
  }

  const retryAt = inWindow[0].createdAt.getTime() + windowMs;
  return {
    allowed: false,
    hitId: hit.id,
    retryAfterSeconds: Math.max(1, Math.ceil((retryAt - Date.now()) / 1000)),
  };
};

export const releaseRateLimitHit = async (hitIds: string[]) => {
  await prisma.rateLimitHit.deleteMany({ where: { id: { in: hitIds } } });
};
