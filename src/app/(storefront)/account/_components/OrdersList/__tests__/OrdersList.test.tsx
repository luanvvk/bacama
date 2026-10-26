import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import { OrdersList } from '../index';

const MESSAGES = {
  Account: { empty: 'No orders yet.', shop: 'Continue shopping' },
  OrderStatus: { paid: 'Paid' },
};

const renderList = (orders: Parameters<typeof OrdersList>[0]['orders']) =>
  render(
    <NextIntlClientProvider locale="en" messages={MESSAGES}>
      <OrdersList orders={orders} />
    </NextIntlClientProvider>,
  );

describe('OrdersList', () => {
  it('shows an empty state linking to the shop', () => {
    renderList([]);

    expect(screen.getByText('No orders yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute(
      'href',
      '/shop',
    );
  });

  it('renders ref, status, total and item names per order', () => {
    renderList([
      {
        ref: 'BCM-1',
        createdAt: new Date('2026-01-02T12:00:00Z'),
        status: 'paid',
        totalVnd: 120000,
        itemNames: ['Espresso', 'Croissant'],
      },
    ]);

    expect(screen.getByText('BCM-1')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText(/120.000/)).toBeInTheDocument();
    expect(screen.getByText('Espresso, Croissant')).toBeInTheDocument();
  });
});
