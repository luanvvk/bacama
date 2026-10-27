jest.mock('@/lib/prisma', () => ({
  prisma: { enrollment: { findUnique: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getLearnerEnrollment } from '../get-learner-enrollment';

const findUnique = prisma.enrollment.findUnique as jest.Mock;

describe('getLearnerEnrollment', () => {
  beforeEach(() => findUnique.mockReset());

  it('looks the enrolment up by user and course together', async () => {
    findUnique.mockResolvedValue(null);

    await getLearnerEnrollment('user-1', 'course-1');

    expect(findUnique.mock.calls[0][0].where).toEqual({
      userId_courseId: { userId: 'user-1', courseId: 'course-1' },
    });
  });

  it('returns null when there is no enrolment', async () => {
    findUnique.mockResolvedValue(null);

    expect(await getLearnerEnrollment('user-1', 'course-1')).toBeNull();
  });

  it.each(['pending', 'cancelled'])('returns null for a %s enrolment', async (status) => {
    findUnique.mockResolvedValue({ id: 'e1', status, progress: [] });

    expect(await getLearnerEnrollment('user-1', 'course-1')).toBeNull();
  });

  it.each(['active', 'completed'])(
    'grants access for a %s enrolment and lists completed lessons',
    async (status) => {
      findUnique.mockResolvedValue({ id: 'e1', status, progress: [{ lessonId: 'l1' }] });

      expect(await getLearnerEnrollment('user-1', 'course-1')).toEqual({
        id: 'e1',
        completedLessonIds: ['l1'],
      });
    },
  );
});
