import { render, screen } from '@testing-library/react';

import type { UserEnrollment } from '@/services/enrollments/get-user-enrollments';

import { EnrollmentList } from '../index';

const MESSAGES: Record<string, string> = {
  empty: 'No courses yet.',
  browseCourses: 'Browse courses',
  completed: 'Completed',
  continue: 'Continue',
  seatHeldUntil: 'Seat held until {time}',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    (MESSAGES[key] ?? key).replace('{time}', values?.time ?? ''),
  useFormatter: () => ({ dateTime: (date: Date) => date.toISOString().slice(0, 16) }),
}));

const enrollment = (overrides: Partial<UserEnrollment> = {}): UserEnrollment => ({
  id: 'e1',
  status: 'active',
  holdExpiresAt: null,
  course: { slug: 'espresso-basics', name: 'Espresso basics', format: 'online' },
  sessionStartsAt: null,
  siteName: null,
  progressPercent: 40,
  ...overrides,
});

describe('EnrollmentList', () => {
  it('links to /courses from the empty state', () => {
    render(<EnrollmentList enrollments={[]} />);

    expect(screen.getByRole('link', { name: 'Browse courses' })).toHaveAttribute(
      'href',
      '/courses',
    );
  });

  it('shows a progress bar and a Continue link for an active enrolment', () => {
    render(<EnrollmentList enrollments={[enrollment()]} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute(
      'href',
      '/courses/espresso-basics',
    );
  });

  it('shows the seat hold for a pending in-person enrolment', () => {
    render(
      <EnrollmentList
        enrollments={[
          enrollment({
            status: 'pending',
            holdExpiresAt: new Date('2026-11-01T10:30:00Z'),
            progressPercent: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText('Seat held until 2026-11-01T10:30')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('shows a completed badge', () => {
    render(<EnrollmentList enrollments={[enrollment({ status: 'completed' })]} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
