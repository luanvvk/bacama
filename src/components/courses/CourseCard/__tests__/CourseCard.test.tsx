import { render, screen } from '@testing-library/react';

import { CourseCard } from '../index';
import { COURSES } from '@/constants/courses';

const latteArt = COURSES[0];
const viennoiserie = COURSES[1];

describe('CourseCard', () => {
  it('renders the course name, format, and price', () => {
    render(<CourseCard course={latteArt} />);

    expect(screen.getByRole('heading', { name: 'Latte Art' })).toBeInTheDocument();
    expect(screen.getByText('Online · 9 lessons')).toBeInTheDocument();
    expect(screen.getByText('790.000 ₫')).toBeInTheDocument();
  });

  it('links the preview image/title to /learn and the CTA to /me', () => {
    render(<CourseCard course={latteArt} />);

    expect(screen.getByRole('link', { name: 'Preview Latte Art' })).toHaveAttribute(
      'href',
      '/learn',
    );
    expect(screen.getByRole('link', { name: 'Enrol →' })).toHaveAttribute('href', '/me');
  });

  it('flags low availability with the warning badge variant', () => {
    render(<CourseCard course={viennoiserie} />);

    expect(screen.getByText('3 seats left · 21–22 Sep')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book a seat →' })).toBeInTheDocument();
  });
});
