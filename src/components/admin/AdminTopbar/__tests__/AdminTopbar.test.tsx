import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdminTopbar } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

describe('AdminTopbar', () => {
  it('links the logo to /admin', () => {
    render(<AdminTopbar />);

    expect(screen.getByRole('link', { name: /Bacama/ })).toHaveAttribute('href', '/admin');
  });

  it('shows a toast instead of performing a real search', async () => {
    render(<AdminTopbar />);

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'ngoc');
    await userEvent.keyboard('{Enter}');

    expect(toast).toHaveBeenCalledWith("Search isn't wired up yet.");
  });
});
