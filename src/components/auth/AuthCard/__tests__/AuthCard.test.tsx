import { render, screen } from '@testing-library/react';

import { AuthCard } from '../index';

describe('AuthCard', () => {
  it('renders the title, description, children, and footer', () => {
    render(
      <AuthCard title="Welcome back" description="Log in to continue." footer="Footer content">
        <p>Form fields</p>
      </AuthCard>,
    );

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    expect(screen.getByText('Log in to continue.')).toBeInTheDocument();
    expect(screen.getByText('Form fields')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('links the logo back to home', () => {
    render(
      <AuthCard title="Welcome back" description="Log in to continue." footer="Footer">
        <p>Form fields</p>
      </AuthCard>,
    );

    expect(screen.getByRole('link', { name: /Bacama/ })).toHaveAttribute('href', '/');
  });
});
