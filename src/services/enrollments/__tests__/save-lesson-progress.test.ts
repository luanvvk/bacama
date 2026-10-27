jest.mock('@/lib/prisma', () => ({
  prisma: {
    lesson: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn() },
    progress: { findUnique: jest.fn(), upsert: jest.fn() },
  },
}));

import { prisma } from '@/lib/prisma';

import { LessonAccessError, saveLessonProgress } from '../save-lesson-progress';

const lessonFind = prisma.lesson.findUnique as jest.Mock;
const enrollmentFind = prisma.enrollment.findUnique as jest.Mock;
const progressFind = prisma.progress.findUnique as jest.Mock;
const upsert = prisma.progress.upsert as jest.Mock;

const input = { userId: 'user-1', lessonId: 'lesson-1', secondsWatched: 42, completed: false };

describe('saveLessonProgress', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    lessonFind.mockResolvedValue({ module: { courseId: 'course-1' } });
    enrollmentFind.mockResolvedValue({ id: 'enr-1', status: 'active' });
    progressFind.mockResolvedValue(null);
  });

  it('finds the enrolment from the user and the course of the lesson', async () => {
    await saveLessonProgress(input);

    expect(enrollmentFind.mock.calls[0][0].where).toEqual({
      userId_courseId: { userId: 'user-1', courseId: 'course-1' },
    });
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      enrollmentId: 'enr-1',
      lessonId: 'lesson-1',
      secondsWatched: 42,
      completedAt: null,
    });
  });

  it('rejects an unknown lesson', async () => {
    lessonFind.mockResolvedValue(null);

    await expect(saveLessonProgress(input)).rejects.toBeInstanceOf(LessonAccessError);
  });

  it.each([null, { id: 'enr-1', status: 'pending' }, { id: 'enr-1', status: 'cancelled' }])(
    'rejects without a paid enrolment (%j)',
    async (enrollment) => {
      enrollmentFind.mockResolvedValue(enrollment);

      await expect(saveLessonProgress(input)).rejects.toBeInstanceOf(LessonAccessError);
      expect(upsert).not.toHaveBeenCalled();
    },
  );

  it('stamps completion when completed', async () => {
    await saveLessonProgress({ ...input, completed: true });

    expect(upsert.mock.calls[0][0].update.completedAt).toBeInstanceOf(Date);
  });

  it('keeps an earlier completion when a later save is not completed', async () => {
    const earlier = new Date('2026-01-01');
    progressFind.mockResolvedValue({ completedAt: earlier });

    await saveLessonProgress(input);

    expect(upsert.mock.calls[0][0].update.completedAt).toBe(earlier);
  });
});
