import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Header } from '../index';
import { useCartStore } from '@/stores/cart';

afterEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe('Header', () => {
  it('renders the logo and primary nav items', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /Bacama/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: 'Coffee & Bakery' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cafés' })).toHaveAttribute('href', '/#sites');
  });

  it('does not show a cart badge when the cart is empty', () => {
    render(<Header />);

    expect(screen.getByRole('button', { name: 'Open cart' })).toBeInTheDocument();
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('shows the item count once the cart has items', () => {
    useCartStore.setState({ items: [{ id: 'x', name: 'X', priceVnd: 1000, quantity: 3 }] });
    render(<Header />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('opens the cart drawer when the cart button is clicked', async () => {
    render(<Header />);

    await userEvent.click(screen.getByRole('button', { name: 'Open cart' }));

    expect(useCartStore.getState().isOpen).toBe(true);
  });
});
