import type { UserEnrollment } from './get-user-enrollments';

/** The lesson player does not exist yet (Phase 4); change this one place when it does. */
export const getContinueHref = (enrollment: Pick<UserEnrollment, 'course'>) =>
  `/courses/${enrollment.course.slug}`;
