import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

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

const enrolSchema = z.object({
  courseId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
});

const BAD_REQUEST_ERRORS = [
  CourseUnavailableError,
  SessionRequiredError,
  SessionNotAllowedError,
  SessionUnavailableError,
];

export const POST = async (request: NextRequest) => {
  const user = await getAuthProvider().getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enrolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const enrollment = await enrolInCourse({ userId: user.id, ...parsed.data });
    return NextResponse.json(
      {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        holdExpiresAt: enrollment.holdExpiresAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AlreadyEnrolledError) {
      return NextResponse.json({ error: 'already_enrolled' }, { status: 409 });
    }
    if (error instanceof SessionFullError) {
      return NextResponse.json({ error: 'session_full' }, { status: 409 });
    }
    if (BAD_REQUEST_ERRORS.some((ErrorClass) => error instanceof ErrorClass)) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
    throw error;
  }
};
