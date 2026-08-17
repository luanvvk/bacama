import { render, screen } from '@testing-library/react';

import { TodaysOrdersTable } from '../index';
import { TODAYS_ORDERS } from '@/constants/admin';

describe('TodaysOrdersTable', () => {
  it('renders every order row', () => {
    render(<TodaysOrdersTable />);

    TODAYS_ORDERS.forEach((order) => {
      expect(screen.getByText(order.ref)).toBeInTheDocument();
      expect(screen.getByText(order.customer)).toBeInTheDocument();
    });
  });

  it('renders the failed-payment order with the destructive badge variant', () => {
    render(<TodaysOrdersTable />);

    const badge = screen.getByText('Payment failed');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });
});
