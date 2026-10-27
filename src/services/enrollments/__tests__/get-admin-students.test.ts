jest.mock('@/lib/prisma', () => ({
  prisma: { enrollment: { findMany: jest.fn(), count: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getAdminStudents } from '../get-admin-students';

const findMany = prisma.enrollment.findMany as jest.Mock;
const count = prisma.enrollment.count as jest.Mock;

const row = (lessonCounts: number[], completed: number) => ({
  id: 'e1',
  status: 'active',
  user: { name: 'Ngoc', email: 'ngoc@example.com' },
  course: {
    titleEn: 'Latte art',
    modules: lessonCounts.map((lessons) => ({ _count: { lessons } })),
  },
  progress: Array.from({ length: completed }, (_, i) => ({ id: `p${i}` })),
});

describe('getAdminStudents', () => {
  beforeEach(() => {
    findMany.mockReset();
    count.mockReset().mockResolvedValue(0);
  });

  it('queries enrolments with no role filter, capped at 200, selecting only displayed fields', async () => {
    findMany.mockResolvedValue([]);

    await getAdminStudents();

    const args = findMany.mock.calls[0][0];
    expect(args.where).toBeUndefined();
    expect(args.take).toBe(200);
    expect(Object.keys(args.select).sort()).toEqual(['course', 'id', 'progress', 'status', 'user']);
    expect(args.select.user).toEqual({ select: { name: true, email: true } });
    expect(Object.keys(args.select.course.select).sort()).toEqual(['modules', 'titleEn']);
  });

  it('maps a row to exactly the displayed keys, with progress as completed over total lessons', async () => {
    findMany.mockResolvedValue([row([2, 2], 1)]);
    count.mockResolvedValue(350);

    const { students, total } = await getAdminStudents();

    expect(total).toBe(350);
    expect(Object.keys(students[0]).sort()).toEqual([
      'courseTitle',
      'email',
      'enrollmentId',
      'name',
      'progressPercent',
      'status',
    ]);
    expect(students[0]).toMatchObject({ courseTitle: 'Latte art', progressPercent: 25 });
  });

  it('shows 0 progress when the course has no lessons', async () => {
    findMany.mockResolvedValue([row([], 0)]);

    const { students } = await getAdminStudents();

    expect(students[0].progressPercent).toBe(0);
  });
});
