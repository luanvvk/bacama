jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: { findFirst: jest.fn() },
    enrollment: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}));
jest.mock('../hold-seat', () => ({
  ...jest.requireActual('../hold-seat'),
  holdSeat: jest.fn(),
}));

import { prisma } from '@/lib/prisma';

import {
  CourseUnavailableError,
  enrolInCourse,
  SessionNotAllowedError,
  SessionRequiredError,
} from '../enrol-in-course';
import { AlreadyEnrolledError, holdSeat } from '../hold-seat';

const course = prisma.course as unknown as Record<string, jest.Mock>;
const enrollment = prisma.enrollment as unknown as Record<string, jest.Mock>;
const args = { userId: 'u1', courseId: 'c1' };

beforeEach(() => {
  jest.resetAllMocks();
  course.findFirst.mockResolvedValue({ format: 'online', priceVnd: 500000 });
  enrollment.findUnique.mockResolvedValue(null);
  enrollment.create.mockResolvedValue({ id: 'e1' });
  enrollment.update.mockResolvedValue({ id: 'e1' });
});

describe('enrolInCourse', () => {
  it('looks up only active courses', async () => {
    await enrolInCourse(args);
    expect(course.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'c1', isActive: true } }),
    );
  });

  it('throws CourseUnavailableError for an unknown or inactive course', async () => {
    course.findFirst.mockResolvedValue(null);
    await expect(enrolInCourse(args)).rejects.toBeInstanceOf(CourseUnavailableError);
  });

  it('creates a pending seatless enrolment for a paid online course', async () => {
    await enrolInCourse(args);
    expect(enrollment.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        courseId: 'c1',
        status: 'pending',
        sessionId: null,
        holdExpiresAt: null,
      },
    });
    expect(holdSeat).not.toHaveBeenCalled();
  });

  it('activates a free online course immediately', async () => {
    course.findFirst.mockResolvedValue({ format: 'online', priceVnd: 0 });
    await enrolInCourse(args);
    expect(enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'active' }) }),
    );
  });

  it('reuses a cancelled row instead of creating a second one', async () => {
    enrollment.findUnique.mockResolvedValue({ id: 'e9', status: 'cancelled' });
    await enrolInCourse(args);
    expect(enrollment.create).not.toHaveBeenCalled();
    expect(enrollment.update).toHaveBeenCalledWith({
      where: { id: 'e9' },
      data: { status: 'pending', sessionId: null, holdExpiresAt: null },
    });
  });

  it('throws AlreadyEnrolledError when an enrolment exists', async () => {
    enrollment.findUnique.mockResolvedValue({ id: 'e9', status: 'active' });
    await expect(enrolInCourse(args)).rejects.toBeInstanceOf(AlreadyEnrolledError);
    expect(enrollment.create).not.toHaveBeenCalled();
  });

  it('maps a P2002 race to AlreadyEnrolledError', async () => {
    enrollment.create.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));
    await expect(enrolInCourse(args)).rejects.toBeInstanceOf(AlreadyEnrolledError);
  });

  it('rethrows other database errors', async () => {
    enrollment.create.mockRejectedValue(new Error('boom'));
    await expect(enrolInCourse(args)).rejects.toThrow('boom');
  });

  it('rejects a session on an online course', async () => {
    await expect(enrolInCourse({ ...args, sessionId: 's1' })).rejects.toBeInstanceOf(
      SessionNotAllowedError,
    );
  });

  it.each(['in_person', 'hybrid'])('holds a seat for %s courses', async (format) => {
    course.findFirst.mockResolvedValue({ format, priceVnd: 1 });
    (holdSeat as jest.Mock).mockResolvedValue({ id: 'e2' });
    await expect(enrolInCourse({ ...args, sessionId: 's1' })).resolves.toEqual({ id: 'e2' });
    expect(holdSeat).toHaveBeenCalledWith({ userId: 'u1', courseId: 'c1', sessionId: 's1' });
  });

  it('requires a session for in-person courses', async () => {
    course.findFirst.mockResolvedValue({ format: 'in_person', priceVnd: 1 });
    await expect(enrolInCourse(args)).rejects.toBeInstanceOf(SessionRequiredError);
  });
});
