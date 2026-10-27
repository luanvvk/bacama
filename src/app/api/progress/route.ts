import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getAuthProvider } from '@/lib/providers/auth';
import { LessonAccessError, saveLessonProgress } from '@/services/enrollments/save-lesson-progress';

const progressSchema = z.object({
  lessonId: z.string().min(1).max(64),
  secondsWatched: z.number().int().min(0).max(86_400),
  completed: z.boolean().default(false),
});

export const POST = async (request: NextRequest) => {
  const user = await getAuthProvider().getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    await saveLessonProgress({ userId: user.id, ...parsed.data });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof LessonAccessError) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    throw error;
  }
};
