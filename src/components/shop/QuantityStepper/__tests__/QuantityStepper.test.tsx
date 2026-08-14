import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuantityStepper } from '../index';

describe('QuantityStepper', () => {
  it('calls onChange with an incremented value', async () => {
    const onChange = jest.fn();
    render(<QuantityStepper value={1} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with a decremented value', async () => {
    const onChange = jest.fn();
    render(<QuantityStepper value={2} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables the decrease button at the minimum', () => {
    render(<QuantityStepper value={1} onChange={jest.fn()} min={1} />);

    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('disables the increase button at the maximum', () => {
    render(<QuantityStepper value={5} onChange={jest.fn()} max={5} />);

    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  });
});
