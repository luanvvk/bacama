import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

afterEach(() => {
  jest.clearAllMocks();
});

describe('LoginForm', () => {
  it('links to /register for people without an account', () => {
    render(<LoginForm />);

    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register');
  });

  it('shows a toast instead of a real sign-in on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'ngoc.le@email.vn');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(toast).toHaveBeenCalledWith("Sign-in isn't wired up yet — this is UI only for now.");
  });

  it('validates the email and password fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
  });
});
