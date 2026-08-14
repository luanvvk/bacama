import { render, screen } from '@testing-library/react';

import { GuestGate } from '../index';

describe('GuestGate', () => {
  it('renders the copy and primary action', () => {
    render(
      <GuestGate
        eyebrow="My page · not signed in"
        title="Pick up where you left off."
        description="Your courses, orders and certificates live here."
        primaryAction={{ label: 'Log in', href: '/login' }}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Pick up where you left off.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('renders the secondary action and hint only when provided', () => {
    const { rerender } = render(
      <GuestGate
        eyebrow="Your orders · not signed in"
        title="Sign in to see your orders."
        description="Every order lives here once you're signed in."
        primaryAction={{ label: 'Log in', href: '/login' }}
      />,
    );

    expect(screen.queryByRole('link', { name: 'Continue shopping' })).not.toBeInTheDocument();

    rerender(
      <GuestGate
        eyebrow="Your orders · not signed in"
        title="Sign in to see your orders."
        description="Every order lives here once you're signed in."
        primaryAction={{ label: 'Log in', href: '/login' }}
        secondaryAction={{ label: 'Continue shopping', href: '/shop' }}
        hint="You don't need an account to check out."
      />,
    );

    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute(
      'href',
      '/shop',
    );
    expect(screen.getByText("You don't need an account to check out.")).toBeInTheDocument();
  });
});
