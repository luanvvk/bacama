import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '../index';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDisabled();
  });

  it.each([
    ['touch-icon', 'size-11', 'lg:size-8'],
    ['touch-icon-sm', 'size-11', 'lg:size-7'],
    ['touch-sm', 'h-11', 'lg:h-7'],
  ] as const)('%s is 44px on phones and compact from lg', (size, phone, desktop) => {
    render(<Button size={size}>Tap</Button>);
    const button = screen.getByRole('button', { name: 'Tap' });
    expect(button).toHaveClass(phone);
    expect(button).toHaveClass(desktop);
  });
});
