jest.mock('@/lib/prisma', () => ({ prisma: { course: { findMany: jest.fn() } } }));

import { prisma } from '@/lib/prisma';

import { getAdminCourses } from '../get-admin-courses';

const findMany = prisma.course.findMany as jest.Mock;
const now = new Date('2026-09-01T00:00:00Z');

const row = (overrides = {}) => ({
  id: 'c1',
  titleEn: 'Latte art',
  metaEn: null,
  format: 'online',
  priceVnd: 100000,
  instructor: { name: 'Minh' },
  sessions: [],
  _count: { enrollments: 3 },
  ...overrides,
});

describe('getAdminCourses', () => {
  beforeEach(() => findMany.mockReset());

  it('lets an admin see every course', async () => {
    findMany.mockResolvedValue([]);

    await getAdminCourses({ id: 'u1', role: 'admin' }, now);

    expect(findMany.mock.calls[0][0].where).toEqual({});
  });

  it('limits an instructor to their own courses', async () => {
    findMany.mockResolvedValue([]);

    await getAdminCourses({ id: 'u2', role: 'instructor' }, now);

    expect(findMany.mock.calls[0][0].where).toEqual({ instructorId: 'u2' });
  });

  it('shows online courses without a seat cap or start date', async () => {
    findMany.mockResolvedValue([row()]);

    const { courses, students } = await getAdminCourses({ id: 'u1', role: 'admin' }, now);

    expect(courses[0]).toMatchObject({
      format: 'online',
      enrolled: 3,
      seatCapacity: null,
      seatsBooked: null,
      nextStartsAt: null,
      instructorName: 'Minh',
    });
    expect(students).toBe(3);
  });

  it('sums seats over upcoming sessions and picks the first as the start', async () => {
    const first = new Date('2026-09-21T02:00:00Z');
    findMany.mockResolvedValue([
      row({
        format: 'in_person',
        instructor: null,
        sessions: [
          { startsAt: first, capacity: 8, seatsBooked: 5 },
          { startsAt: new Date('2026-10-01T02:00:00Z'), capacity: 8, seatsBooked: 1 },
        ],
      }),
    ]);

    const { courses } = await getAdminCourses({ id: 'u1', role: 'admin' }, now);

    expect(courses[0]).toMatchObject({
      format: 'in-person',
      seatCapacity: 16,
      seatsBooked: 6,
      nextStartsAt: first,
      instructorName: null,
    });
  });
});
