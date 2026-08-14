import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardActions } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

describe('DashboardActions', () => {
  it('calls window.print for the print action', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    render(<DashboardActions />);

    await userEvent.click(screen.getByRole('button', { name: /Print today.s orders/ }));

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('shows a toast instead of navigating for + New product', async () => {
    render(<DashboardActions />);

    await userEvent.click(screen.getByRole('button', { name: '+ New product' }));

    expect(toast).toHaveBeenCalledWith(
      "New product isn't wired up yet — coming with the Admin catalogue group.",
    );
  });
});
