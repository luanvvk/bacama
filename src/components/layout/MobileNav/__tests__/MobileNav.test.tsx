import { render, screen } from '@testing-library/react';

import { MobileNav } from '../index';

const MESSAGES: Record<string, string> = {
  signIn: 'Log in',
  profile: 'My profile',
  myLearning: 'My learning',
  myOrders: 'My orders',
  teacherConsole: 'Teacher console',
  adminConsole: 'Admin console',
  logOut: 'Log out',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));

const signOut = jest.fn();
let mockUseUser = () => ({ isLoaded: true, user: null as { fullName: string } | null });

jest.mock('@clerk/nextjs', () => ({
  Show: ({ when, children }: { when: 'signed-in' | 'signed-out'; children: React.ReactNode }) => {
    const { isLoaded, user } = mockUseUser();
    if (!isLoaded) return null;
    const isSignedIn = Boolean(user);
    return (isSignedIn && when === 'signed-in') || (!isSignedIn && when === 'signed-out')
      ? children
      : null;
  },
  useClerk: () => ({ signOut }),
  useUser: () => mockUseUser(),
}));

afterEach(() => {
  jest.clearAllMocks();
  mockUseUser = () => ({ isLoaded: true, user: null });
});

describe('MobileNav', () => {
  it('shows only a sign-in link when signed out', () => {
    render(<MobileNav navItems={[]} />);

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: 'My orders' })).not.toBeInTheDocument();
  });

  it('shows account links but not staff links for a signed-in customer', () => {
    mockUseUser = () => ({ isLoaded: true, user: { fullName: 'Ada Lovelace' } });
    render(<MobileNav navItems={[]} role="customer" />);

    expect(screen.getByRole('link', { name: 'My profile' })).toHaveAttribute(
      'href',
      '/account/profile',
    );
    expect(screen.getByRole('link', { name: 'My orders' })).toHaveAttribute('href', '/account');
    expect(screen.queryByRole('link', { name: 'Teacher console' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin console' })).not.toBeInTheDocument();
  });

  it('shows staff links for a signed-in instructor', () => {
    mockUseUser = () => ({ isLoaded: true, user: { fullName: 'Ada Lovelace' } });
    render(<MobileNav navItems={[]} role="instructor" />);

    expect(screen.getByRole('link', { name: 'Teacher console' })).toHaveAttribute('href', '/teach');
  });
});
