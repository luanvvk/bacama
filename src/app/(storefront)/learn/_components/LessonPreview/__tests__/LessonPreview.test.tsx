import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LessonPreview } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

describe('LessonPreview', () => {
  it('renders the free-preview banner and lesson content', () => {
    render(<LessonPreview />);

    expect(screen.getByText(/watching the free preview/)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'The heart — pour slow, finish clean' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('shows a sign-in toast instead of playing a real video', async () => {
    render(<LessonPreview />);

    await userEvent.click(screen.getByRole('button', { name: 'Play preview' }));

    expect(toast).toHaveBeenCalledWith('Sign in to watch the full lesson.');
  });

  it('gates the documents tab behind sign-in', async () => {
    render(<LessonPreview />);

    await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));

    expect(screen.getByText('Milk ratio & temperature chart')).toBeInTheDocument();
    expect(screen.getAllByText('Sign in to download').length).toBeGreaterThan(0);
  });

  it('renders the course outline with the current lesson marked', () => {
    render(<LessonPreview />);

    expect(screen.getByText('The heart')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in to join the discussion' })).toHaveAttribute(
      'href',
      '/login',
    );
  });
});
