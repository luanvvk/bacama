import { render, screen } from '@testing-library/react';

import { CardMedia } from '../index';

describe('CardMedia', () => {
  it('renders the image when there is one', () => {
    render(<CardMedia src="https://example.test/a.jpg" alt="A croissant" />);

    expect(screen.getByAltText('A croissant')).toBeInTheDocument();
  });

  it('falls back rather than rendering an image with no source', () => {
    render(<CardMedia src={null} alt="A croissant" fallback={<span>No photo yet</span>} />);

    expect(screen.queryByAltText('A croissant')).not.toBeInTheDocument();
    expect(screen.getByText('No photo yet')).toBeInTheDocument();
  });

  it('renders overlays on top of the image', () => {
    render(
      <CardMedia src="https://example.test/a.jpg" alt="A bag">
        <span>Sold out today</span>
      </CardMedia>,
    );

    expect(screen.getByText('Sold out today')).toBeInTheDocument();
  });
});
