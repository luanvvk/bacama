import { render, screen } from '@testing-library/react';

import { Footer } from '../index';

describe('Footer', () => {
  it('renders the full column layout by default', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { name: 'Coffee' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workshops' })).toBeInTheDocument();
    expect(screen.getByText('hang@bacama.vn')).toBeInTheDocument();
  });

  it('omits the column layout in the simple variant', () => {
    render(<Footer variant="simple" />);

    expect(screen.queryByRole('heading', { name: 'Coffee' })).not.toBeInTheDocument();
    expect(screen.getByText(/2026 Bacama/)).toBeInTheDocument();
  });
});
