import { render, screen } from '@testing-library/react';

import { AdminTopbar } from '../index';

describe('AdminTopbar', () => {
  it('links the logo to /admin', () => {
    render(<AdminTopbar />);

    expect(screen.getByRole('link', { name: /Bacama/ })).toHaveAttribute('href', '/admin');
  });

  it('provides a mobile admin navigation trigger', () => {
    render(<AdminTopbar />);

    expect(screen.getByRole('button', { name: 'Open admin menu' })).toBeInTheDocument();
  });

  it('submits the search to the orders list', () => {
    render(<AdminTopbar />);

    const search = screen.getByRole('searchbox', { name: 'Search orders' });
    expect(search).toHaveAttribute('name', 'q');
    expect(search.closest('form')).toHaveAttribute('action', '/admin/orders');
  });
});
