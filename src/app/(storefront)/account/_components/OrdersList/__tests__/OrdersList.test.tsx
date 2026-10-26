import { render, screen } from '@testing-library/react';
import { OrdersList } from '../index';

const MESSAGES: Record<string, Record<string, string>> = {
  Account: { empty: 'No orders yet.', shop: 'Continue shopping' },
  OrderStatus: { paid: 'Paid' },
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => MESSAGES[namespace]?.[key] ?? key,
  useFormatter: () => ({ dateTime: (date: Date) => date.toISOString().slice(0, 10) }),
}));

const renderList = (orders: Parameters<typeof OrdersList>[0]['orders']) =>
  render(<OrdersList orders={orders} />);

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
