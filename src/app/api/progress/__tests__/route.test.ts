/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { LessonAccessError, saveLessonProgress } from '@/services/enrollments/save-lesson-progress';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/services/enrollments/save-lesson-progress', () => ({
  ...jest.requireActual('@/services/enrollments/save-lesson-progress'),
  saveLessonProgress: jest.fn(),
}));

const getCurrentUser = jest.fn();
const save = jest.mocked(saveLessonProgress);

const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/progress', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );

describe('POST /api/progress', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
    getCurrentUser.mockResolvedValue({ id: 'user-1' });
  });

  it('401s a guest', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await post({ lessonId: 'l1', secondsWatched: 5 })).status).toBe(401);
  });

  it('400s an invalid body', async () => {
    expect((await post({ lessonId: 'l1', secondsWatched: -1 })).status).toBe(400);
    expect((await post({ secondsWatched: 5 })).status).toBe(400);
  });

  it('saves for the signed-in user and ignores a client-sent user id', async () => {
    const response = await post({ lessonId: 'l1', secondsWatched: 5, userId: 'victim' });

    expect(response.status).toBe(204);
    expect(save).toHaveBeenCalledWith({
      userId: 'user-1',
      lessonId: 'l1',
      secondsWatched: 5,
      completed: false,
    });
  });

  it('403s when the user has no access to the lesson', async () => {
    save.mockRejectedValue(new LessonAccessError());

    expect((await post({ lessonId: 'l1', secondsWatched: 5 })).status).toBe(403);
  });
});
