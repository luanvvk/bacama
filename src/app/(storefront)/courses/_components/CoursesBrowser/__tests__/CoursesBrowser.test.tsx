import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CoursesBrowser } from '../index';
import { COURSE_FIXTURES } from '@/services/courses/__fixtures__/courses';

describe('CoursesBrowser', () => {
  it('shows every course by default', () => {
    render(<CoursesBrowser courses={COURSE_FIXTURES} />);

    COURSE_FIXTURES.forEach((course) => {
      expect(screen.getByRole('heading', { name: course.name })).toBeInTheDocument();
    });
  });

  it('filters to just the selected format', async () => {
    render(<CoursesBrowser courses={COURSE_FIXTURES} />);

    await userEvent.click(screen.getByRole('button', { name: 'In-person' }));

    expect(screen.getByRole('heading', { name: 'Viennoiserie Weekend' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Latte Art' })).not.toBeInTheDocument();
  });

  it('shows every course again once "All" is reselected', async () => {
    render(<CoursesBrowser courses={COURSE_FIXTURES} />);

    await userEvent.click(screen.getByRole('button', { name: 'Online' }));
    await userEvent.click(screen.getByRole('button', { name: 'All' }));

    COURSE_FIXTURES.forEach((course) => {
      expect(screen.getByRole('heading', { name: course.name })).toBeInTheDocument();
    });
  });

  it('sorts by price low to high', async () => {
    render(<CoursesBrowser courses={COURSE_FIXTURES} />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Price: low to high' }));

    const headings = screen.getAllByRole('heading', { level: 2 }).map((el) => el.textContent);
    const cheapest = [...COURSE_FIXTURES].sort((a, b) => a.priceVnd - b.priceVnd)[0];
    expect(headings[0]).toBe(cheapest.name);
  });

  it('shows an empty state when no course matches the filter', async () => {
    render(<CoursesBrowser courses={[COURSE_FIXTURES[1]]} />);

    await userEvent.click(screen.getByRole('button', { name: 'Online' }));

    expect(screen.getByText('No courses match those filters.')).toBeInTheDocument();
  });
});
