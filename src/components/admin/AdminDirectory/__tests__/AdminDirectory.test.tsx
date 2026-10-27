import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AdminCourse } from '@/services/courses/get-admin-courses';

import { AdminDirectory } from '../index';

const online: AdminCourse = {
  id: 'c1',
  name: 'Latte art',
  format: 'online',
  priceVnd: 100000,
  instructorName: 'Minh',
  enrolled: 42,
  seatCapacity: null,
  seatsBooked: null,
  nextStartsAt: null,
};
const inPerson: AdminCourse = {
  ...online,
  id: 'c2',
  name: 'Viennoiserie',
  format: 'in-person',
  instructorName: null,
  enrolled: 6,
  seatCapacity: 8,
  seatsBooked: 5,
  nextStartsAt: new Date('2026-09-21T02:00:00Z'),
};

describe('AdminDirectory', () => {
  it('computes the eyebrow from the data and shows seat counts', () => {
    render(<AdminDirectory courses={[online, inPerson]} students={48} />);

    expect(screen.getByText('2 courses · 48 students')).toBeInTheDocument();
    expect(screen.getByText('42 / ∞')).toBeInTheDocument();
    expect(screen.getByText('5 / 8')).toBeInTheDocument();
    expect(screen.getByText('Anytime')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('has no dead action buttons and filters by search', async () => {
    render(<AdminDirectory courses={[online, inPerson]} students={48} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Search courses'), 'vienn');

    expect(screen.queryByText('Latte art')).not.toBeInTheDocument();
    expect(screen.getByText('Viennoiserie')).toBeInTheDocument();
  });
});
