import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductGallery } from '../index';

const IMAGES = ['/a.jpg', '/b.jpg', '/c.jpg'];

describe('ProductGallery', () => {
  it('shows the first image as active by default', () => {
    render(<ProductGallery images={IMAGES} alt="A bag of coffee" />);

    expect(screen.getByRole('button', { name: 'Show image 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches the active image on thumbnail click', async () => {
    render(<ProductGallery images={IMAGES} alt="A bag of coffee" />);

    await userEvent.click(screen.getByRole('button', { name: 'Show image 2' }));

    expect(screen.getByRole('button', { name: 'Show image 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Show image 1' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
