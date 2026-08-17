import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Rating } from '../index';

describe('Rating', () => {
  it('renders a read-only rating with an accessible label', () => {
    render(<Rating value={3} max={5} />);

    expect(screen.getByRole('img', { name: 'Rated 3 out of 5 stars' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders interactive stars when onChange is provided', () => {
    render(<Rating value={2} max={5} onChange={jest.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('button', { name: '2 stars' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with the clicked star value', async () => {
    const onChange = jest.fn();
    render(<Rating value={2} max={5} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: '4 stars' }));

    expect(onChange).toHaveBeenCalledWith(4);
  });
});
