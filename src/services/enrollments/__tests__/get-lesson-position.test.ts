jest.mock('@/lib/prisma', () => ({ prisma: { progress: { findUnique: jest.fn() } } }));

import { prisma } from '@/lib/prisma';

import { getLessonPosition } from '../get-lesson-position';

const find = prisma.progress.findUnique as jest.Mock;

describe('getLessonPosition', () => {
  it('returns the saved seconds', async () => {
    find.mockResolvedValue({ secondsWatched: 90, completedAt: null });

    expect(await getLessonPosition('enr-1', 'lesson-1')).toBe(90);
  });

  it('returns 0 with no progress or a completed lesson', async () => {
    find.mockResolvedValueOnce(null);
    find.mockResolvedValueOnce({ secondsWatched: 300, completedAt: new Date() });

    expect(await getLessonPosition('enr-1', 'lesson-1')).toBe(0);
    expect(await getLessonPosition('enr-1', 'lesson-1')).toBe(0);
  });
});
