jest.mock('@/lib/prisma', () => ({ prisma: { lesson: { findUnique: jest.fn() } } }));

import { prisma } from '@/lib/prisma';

import { getLessonVideoId } from '../get-lesson-video-id';

const findUnique = prisma.lesson.findUnique as jest.Mock;

describe('getLessonVideoId', () => {
  beforeEach(() => findUnique.mockReset());

  it('returns the stored video id for the lesson', async () => {
    findUnique.mockResolvedValue({ videoId: 'jNQXAC9IVRw' });

    expect(await getLessonVideoId('lesson-1')).toBe('jNQXAC9IVRw');
    expect(findUnique.mock.calls[0][0].where).toEqual({ id: 'lesson-1' });
  });

  it('returns null when the lesson has no video or does not exist', async () => {
    findUnique.mockResolvedValueOnce({ videoId: null });
    findUnique.mockResolvedValueOnce(null);

    expect(await getLessonVideoId('lesson-1')).toBeNull();
    expect(await getLessonVideoId('missing')).toBeNull();
  });
});
