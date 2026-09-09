import { render, screen } from '@testing-library/react';

import { CourseCard } from '../index';
import { COURSE_FIXTURES } from '@/services/courses/__fixtures__/courses';

const MESSAGES: Record<string, string> = {
  formatOnline: 'Online',
  formatInPerson: 'In-person',
  formatHybrid: 'Hybrid',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));

const [latteArt, viennoiserie, cuppingOrigin] = COURSE_FIXTURES;

describe('CourseCard', () => {
  it('renders the course name, format, and price', () => {
    render(<CourseCard course={latteArt} />);

    expect(screen.getByRole('heading', { name: 'Latte Art' })).toBeInTheDocument();
    expect(screen.getByText('Online · 9 lessons')).toBeInTheDocument();
    expect(screen.getByText('790.000 ₫')).toBeInTheDocument();
  });

  it('links the image/title and the CTA to the course detail page', () => {
    render(<CourseCard course={latteArt} />);

    const links = screen.getAllByRole('link', { name: 'Latte Art' });
    expect(links[0]).toHaveAttribute('href', '/courses/latte-art');
    expect(screen.getByRole('link', { name: 'Enrol →' })).toHaveAttribute(
      'href',
      '/courses/latte-art',
    );
  });

  it('flags a seat-limited course with the warning badge variant', () => {
    render(<CourseCard course={viennoiserie} />);

    expect(screen.getByText('Limited seats')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book a seat →' })).toBeInTheDocument();
  });

  it('falls back to the format label when a course has no photo or meta', () => {
    render(<CourseCard course={cuppingOrigin} />);

    expect(screen.queryByAltText('Cupping & Origin')).not.toBeInTheDocument();
    expect(screen.getAllByText('Online')).not.toHaveLength(0);
  });
});
