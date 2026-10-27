import { render, screen } from '@testing-library/react';

import { TodaysOrdersTable } from '../index';
import type { AdminTodayOrder } from '@/services/orders/admin-orders';

const order = (overrides: Partial<AdminTodayOrder>): AdminTodayOrder => ({
  ref: 'BC-1',
  customerName: 'Lê Thị Ngọc',
  paymentProvider: 'zalopay',
  totalVnd: 780000,
  status: 'paid',
  acknowledgedAt: null,
  items: [{ nameSnapshot: 'Đà Lạt Washed 1 kg', quantity: 1 }],
  ...overrides,
});

describe('TodaysOrdersTable', () => {
  it('renders a row per order with a summary of its items', () => {
    render(
      <TodaysOrdersTable
        orders={[
          order({}),
          order({
            ref: 'BC-2',
            customerName: 'Trần Đức Khôi',
            items: [
              { nameSnapshot: 'House Blend', quantity: 2 },
              { nameSnapshot: 'Filter', quantity: 1 },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getByText('BC-1')).toBeInTheDocument();
    expect(screen.getByText('Lê Thị Ngọc')).toBeInTheDocument();
    expect(screen.getByText('House Blend × 2 +1 more')).toBeInTheDocument();
  });

  it('renders the failed-payment order with the destructive badge variant', () => {
    render(<TodaysOrdersTable orders={[order({ status: 'failed' })]} />);

    expect(screen.getByText('Payment failed')).toHaveAttribute('data-variant', 'destructive');
  });

  it('says so when there are no orders today', () => {
    render(<TodaysOrdersTable orders={[]} />);

    expect(screen.getByText('No orders yet today.')).toBeInTheDocument();
  });
});
