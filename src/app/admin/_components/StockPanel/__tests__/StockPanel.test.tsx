import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StockPanel } from '../index';
import { toast } from '@/lib/toast';

jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

describe('StockPanel', () => {
  it('renders each stock item with its current quantity', () => {
    render(<StockPanel />);

    expect(screen.getByLabelText('Đà Lạt Washed stock')).toHaveValue(42);
    expect(screen.getByLabelText('Sơn La Natural stock')).toHaveValue(6);
  });

  it('lets the quantity be edited locally', async () => {
    render(<StockPanel />);

    const input = screen.getByLabelText('Đà Lạt Washed stock');
    await userEvent.clear(input);
    await userEvent.type(input, '50');

    expect(input).toHaveValue(50);
  });

  it('shows a toast instead of persisting on save', async () => {
    render(<StockPanel />);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(toast).toHaveBeenCalledWith('Not wired up yet — stock edits need a backend.');
  });
});
