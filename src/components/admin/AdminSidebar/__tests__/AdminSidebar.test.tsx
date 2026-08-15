import { render, screen } from '@testing-library/react';

import { AdminSidebar } from '../index';

describe('AdminSidebar', () => {
  it('links Overview to /admin', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute('href', '/admin');
  });

  it('links the implemented operations sections', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: /Online orders/ })).toHaveAttribute(
      'href',
      '/admin/orders',
    );
    expect(screen.getByRole('link', { name: /Shipments/ })).toHaveAttribute(
      'href',
      '/admin/shipments',
    );
  });

  it('shows counts where provided', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('84')).toBeInTheDocument();
  });
});
