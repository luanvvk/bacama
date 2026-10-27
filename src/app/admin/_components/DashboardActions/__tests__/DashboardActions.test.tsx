import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardActions } from '../index';

describe('DashboardActions', () => {
  it('calls window.print for the print action', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    render(<DashboardActions />);

    await userEvent.click(screen.getByRole('button', { name: /Print today.s orders/ }));

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('links to the catalogue instead of a dead action', () => {
    render(<DashboardActions />);

    expect(screen.getByRole('link', { name: 'Manage catalogue' })).toHaveAttribute(
      'href',
      '/admin/catalog',
    );
  });
});
