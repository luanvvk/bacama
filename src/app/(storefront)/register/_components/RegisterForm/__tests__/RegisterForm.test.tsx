import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RegisterForm } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

afterEach(() => {
  jest.clearAllMocks();
});

describe('RegisterForm', () => {
  it('links to /login for people who already have an account', () => {
    render(<RegisterForm />);

    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
  });

  it('shows a toast instead of a real sign-up on submit', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText('Full name'), 'Lê Thị Ngọc');
    await user.type(screen.getByLabelText('Email'), 'ngoc.le@email.vn');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(toast).toHaveBeenCalledWith("Sign-up isn't wired up yet — this is UI only for now.");
  });

  it('validates all fields before submitting', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
  });
});
