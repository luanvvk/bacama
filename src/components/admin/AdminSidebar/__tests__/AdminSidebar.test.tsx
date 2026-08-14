import { render, screen } from '@testing-library/react';

import { AdminSidebar } from '../index';

describe('AdminSidebar', () => {
  it('links Overview to /admin', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute('href', '/admin');
  });

  it('renders not-yet-built sections as non-interactive with a Soon badge', () => {
    render(<AdminSidebar />);

    expect(screen.queryByRole('link', { name: /Online orders/ })).not.toBeInTheDocument();
    expect(screen.getByText('Online orders')).toBeInTheDocument();
    expect(screen.getAllByText('Soon').length).toBeGreaterThan(0);
  });

  it('shows counts where provided', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('84')).toBeInTheDocument();
  });
});
