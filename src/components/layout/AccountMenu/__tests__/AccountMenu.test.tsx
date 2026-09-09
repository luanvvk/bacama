import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountMenu } from '../index';

const MESSAGES: Record<string, string> = {
  loadingAccount: 'Loading account',
  welcome: 'Welcome',
  notSignedIn: 'Not signed in',
  signIn: 'Log in',
  signInCta: 'Sign in / Create account',
  yourAccount: 'Your Bacama account',
  profile: 'My profile',
  myLearning: 'My learning',
  myOrders: 'My orders',
  staffAccess: 'Staff access',
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

describe('AccountMenu', () => {
  it('shows a sign-in prompt when signed out', async () => {
    render(<AccountMenu />);

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Not signed in')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Sign in \/ Create account/ })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('shows account links and staff links when signed in', async () => {
    mockUseUser = () => ({ isLoaded: true, user: { fullName: 'Ada Lovelace' } });
    render(<AccountMenu />);

    await userEvent.click(screen.getByRole('button', { name: 'Ada Lovelace' }));

    expect(await screen.findByRole('menuitem', { name: /My profile/ })).toHaveAttribute(
      'href',
      '/account/profile',
    );
    expect(screen.getByRole('menuitem', { name: /My learning/ })).toHaveAttribute('href', '/me');
    expect(screen.getByRole('menuitem', { name: /My orders/ })).toHaveAttribute('href', '/account');
    expect(screen.getByRole('menuitem', { name: /Teacher console/ })).toHaveAttribute(
      'href',
      '/teach',
    );
    expect(screen.getByRole('menuitem', { name: /Admin console/ })).toHaveAttribute(
      'href',
      '/admin',
    );
  });

  it('signs out when "Log out" is clicked', async () => {
    mockUseUser = () => ({ isLoaded: true, user: { fullName: 'Ada Lovelace' } });
    render(<AccountMenu />);

    await userEvent.click(screen.getByRole('button', { name: 'Ada Lovelace' }));
    await userEvent.click(await screen.findByText('Log out'));

    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' });
  });
});
