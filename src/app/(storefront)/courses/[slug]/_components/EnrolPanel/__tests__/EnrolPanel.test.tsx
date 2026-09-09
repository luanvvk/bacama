import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EnrolPanel } from '../index';
import { type CourseDetail } from '@/services/courses/map-course';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

const MESSAGES: Record<string, string> = {
  formatOnline: 'Online',
  formatInPerson: 'In-person',
  formatHybrid: 'Hybrid',
  enrol: 'Enrol',
  bookSeat: 'Book a seat',
  loginToEnrol: 'Log in to enrol',
  enrolNotReady: "Enrolment isn't wired up yet.",
  soldOut: 'Sold out',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
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

  it('toasts that enrolment is not wired up yet for a signed-in visitor', async () => {
    render(<EnrolPanel course={course} />);

    await userEvent.click(screen.getByRole('button', { name: 'Enrol' }));

    expect(toast).toHaveBeenCalledWith("Enrolment isn't wired up yet.");
  });

  it('uses "Book a seat" for an in-person course', () => {
    render(<EnrolPanel course={{ ...course, format: 'in-person', seatLimited: true }} />);

    expect(screen.getByRole('button', { name: 'Book a seat' })).toBeInTheDocument();
  });

  it('disables the CTA once every session is fully booked', () => {
    render(
      <EnrolPanel
        course={{
          ...course,
          format: 'in-person',
          seatLimited: true,
          sessions: [
            {
              id: 'session-1',
              startsAt: 'Mon, Sep 14 · 09:00',
              siteName: 'Hoi An',
              siteSlug: 'hoi-an',
              capacity: 8,
              seatsLeft: 0,
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });
});
