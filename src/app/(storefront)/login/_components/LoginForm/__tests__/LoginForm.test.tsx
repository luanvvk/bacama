import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '../index';

jest.mock('@clerk/nextjs/legacy', () => ({
  useSignIn: () => ({
    isLoaded: true,
    signIn: {
      create: jest.fn().mockResolvedValue({ status: 'complete', createdSessionId: 'session' }),
      attemptFirstFactor: jest.fn(),
      attemptSecondFactor: jest.fn(),
      resetPassword: jest.fn(),
      authenticateWithRedirect: jest.fn(),
    },
    setActive: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  it('links to /register for people without an account', () => {
    render(<LoginForm />);

    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register');
  });

  it('submits credentials through Clerk', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'ngoc.le@email.vn');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('validates the email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });
});
