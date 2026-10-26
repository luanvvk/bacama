import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EnrolPanel } from '../index';
import { type CourseDetail } from '@/services/courses/map-course';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const MESSAGES: Record<string, string> = {
  formatOnline: 'Online',
  formatInPerson: 'In-person',
  formatHybrid: 'Hybrid',
  enrol: 'Enrol',
  bookSeat: 'Book a seat',
  loginToEnrol: 'Log in to enrol',
  chooseSession: 'Choose a session',
  sessionFull: 'Full',
  seatHeld: 'Seat held until {time}',
  enrolled: "You're enrolled.",
  enrolPending: 'Enrolment saved.',
  alreadyEnrolled: 'Already enrolled.',
  sessionJustFilled: 'Session just filled.',
  enrolFailed: 'Enrolment failed.',
  soldOut: 'Sold out',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { time?: string }) =>
    MESSAGES[key].replace('{time}', values?.time ?? ''),
  useFormatter: () => ({ dateTime: () => '10:00' }),
}));

let signedIn = true;

jest.mock('@clerk/nextjs', () => ({
  Show: ({ when, children }: { when: 'signed-in' | 'signed-out'; children: React.ReactNode }) =>
    (signedIn && when === 'signed-in') || (!signedIn && when === 'signed-out') ? children : null,
}));

const course: CourseDetail = {
  id: 'course-1',
  slug: 'latte-art',
  name: 'Latte Art',
  format: 'online',
  meta: '9 lessons',
  description: 'Video lessons with live discussion.',
  priceVnd: 790_000,
  availability: 'Free preview lesson',
  seatLimited: false,
  ctaLabel: 'Enrol',
  modules: [],
  sessions: [],
};

const session = {
  siteName: 'Hoi An',
  siteSlug: 'hoi-an',
  capacity: 8,
};

const inPersonCourse: CourseDetail = {
  ...course,
  format: 'in-person',
  seatLimited: true,
  sessions: [
    { ...session, id: 'session-1', startsAt: 'Mon, Sep 14', seatsLeft: 3 },
    { ...session, id: 'session-2', startsAt: 'Tue, Sep 15', seatsLeft: 0 },
  ],
};

const mockFetch = (status: number, body: unknown) => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  global.fetch = fetchMock;
  return fetchMock;
};

afterEach(() => {
  jest.clearAllMocks();
  signedIn = true;
});

describe('EnrolPanel', () => {
  it('renders the course name and price', () => {
    render(<EnrolPanel course={course} />);

    expect(screen.getByRole('heading', { name: 'Latte Art' })).toBeInTheDocument();
    expect(screen.getByText('790.000 ₫')).toBeInTheDocument();
  });

  it('prompts a guest to log in instead of enrolling directly', () => {
    signedIn = false;
    render(<EnrolPanel course={course} />);

    expect(screen.getByRole('link', { name: 'Log in to enrol' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button', { name: 'Enrol' })).not.toBeInTheDocument();
  });

  it('enrols in an online course directly and refreshes', async () => {
    const fetchMock = mockFetch(201, {
      enrollmentId: 'enrollment-1',
      status: 'pending',
      holdExpiresAt: null,
    });
    render(<EnrolPanel course={course} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enrol' }));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/enrollments',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ courseId: 'course-1' }) }),
    );
    expect(await screen.findByText('Enrolment saved.')).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it('requires a session for an in-person course and posts the chosen one', async () => {
    const fetchMock = mockFetch(201, {
      enrollmentId: 'enrollment-1',
      status: 'pending',
      holdExpiresAt: '2026-10-27T10:00:00Z',
    });
    render(<EnrolPanel course={inPersonCourse} />);
    const button = screen.getByRole('button', { name: 'Book a seat' });

    expect(button).toBeDisabled();
    expect(screen.getByRole('radio', { name: /Tue, Sep 15/ })).toBeDisabled();

    await userEvent.click(screen.getByRole('radio', { name: /Mon, Sep 14/ }));
    await userEvent.click(button);

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      courseId: 'course-1',
      sessionId: 'session-1',
    });
    expect(await screen.findByText('Seat held until 10:00')).toBeInTheDocument();
  });

  it.each([
    [409, { error: 'already_enrolled' }, 'Already enrolled.'],
    [409, { error: 'session_full' }, 'Session just filled.'],
    [400, { error: 'invalid_request' }, 'Enrolment failed.'],
    [500, {}, 'Enrolment failed.'],
  ])('shows the message for a %i response %p', async (status, body, message) => {
    mockFetch(status, body);
    render(<EnrolPanel course={course} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enrol' }));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it('uses "Book a seat" for an in-person course', () => {
    render(<EnrolPanel course={inPersonCourse} />);

    expect(screen.getByRole('button', { name: 'Book a seat' })).toBeInTheDocument();
  });

  it('disables the CTA once every session is fully booked', () => {
    render(
      <EnrolPanel
        course={{
          ...inPersonCourse,
          sessions: [{ ...session, id: 'session-1', startsAt: 'Mon, Sep 14', seatsLeft: 0 }],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });
});
