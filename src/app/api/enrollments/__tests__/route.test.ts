/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import {
  CourseUnavailableError,
  enrolInCourse,
  SessionNotAllowedError,
  SessionRequiredError,
} from '@/services/enrollments/enrol-in-course';
import {
  AlreadyEnrolledError,
  SessionFullError,
  SessionUnavailableError,
} from '@/services/enrollments/hold-seat';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/enrollments/enrol-in-course', () => ({
  ...jest.requireActual('@/services/enrollments/enrol-in-course'),
  enrolInCourse: jest.fn(),
}));

const getCurrentUser = jest.fn();
const enrol = jest.mocked(enrolInCourse);

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/enrollments', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  getCurrentUser.mockResolvedValue({ id: 'user-1' });
});

afterEach(() => jest.resetAllMocks());

describe('POST /api/enrollments', () => {
  it('returns 401 for a guest without enrolling', async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await post({ courseId: 'c1' });

    expect(response.status).toBe(401);
    expect(enrol).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid input', async () => {
    expect((await post({})).status).toBe(400);
    expect((await post('not json')).status).toBe(400);
    expect(enrol).not.toHaveBeenCalled();
  });

  it('takes the user from the session and ignores a userId in the body', async () => {
    enrol.mockResolvedValue({ id: 'e1', status: 'active', holdExpiresAt: null } as never);

    await post({ courseId: 'c1', sessionId: 's1', userId: 'attacker' });

    expect(enrol).toHaveBeenCalledWith({ userId: 'user-1', courseId: 'c1', sessionId: 's1' });
  });

  it('returns 201 with the enrolment shape', async () => {
    const holdExpiresAt = new Date('2026-10-27T10:00:00Z');
    enrol.mockResolvedValue({ id: 'e1', status: 'pending', holdExpiresAt } as never);

    const response = await post({ courseId: 'c1', sessionId: 's1' });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      enrollmentId: 'e1',
      status: 'pending',
      holdExpiresAt: holdExpiresAt.toISOString(),
    });
  });

  it.each([
    [new AlreadyEnrolledError(), 409],
    [new SessionFullError(), 409],
    [new SessionUnavailableError(), 400],
    [new SessionRequiredError(), 400],
    [new SessionNotAllowedError(), 400],
    [new CourseUnavailableError(), 400],
  ])('maps %p to %i', async (error, status) => {
    enrol.mockRejectedValue(error);

    expect((await post({ courseId: 'c1' })).status).toBe(status);
  });

  it('rethrows unexpected errors', async () => {
    enrol.mockRejectedValue(new Error('boom'));

    await expect(post({ courseId: 'c1' })).rejects.toThrow('boom');
  });
});
