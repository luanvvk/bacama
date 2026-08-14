import { render, screen } from '@testing-library/react';

import { ProductCard } from '../index';
import { PRODUCTS } from '@/constants/products';

const [dalatWashed] = PRODUCTS;
const soldOutProduct = PRODUCTS.find((product) => product.soldOut)!;

describe('ProductCard', () => {
  it('renders the product name, description, and price', () => {
    render(<ProductCard product={dalatWashed} />);

    expect(screen.getByRole('heading', { name: dalatWashed.name })).toBeInTheDocument();
    expect(screen.getByText(dalatWashed.description)).toBeInTheDocument();
    expect(screen.getByText('280.000 ₫')).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    render(<ProductCard product={dalatWashed} />);

    const links = screen.getAllByRole('link', { name: dalatWashed.name });
    expect(links[0]).toHaveAttribute('href', `/product/${dalatWashed.slug}`);
  });

  it('shows a sold-out overlay and "Notify me" for sold-out products', () => {
    render(<ProductCard product={soldOutProduct} />);

    expect(screen.getByText('Sold out today')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Notify me' })).toBeInTheDocument();
  });
});
