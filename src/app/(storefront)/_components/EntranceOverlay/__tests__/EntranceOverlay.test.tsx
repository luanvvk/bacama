import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EntranceOverlay } from '../index';

let searchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
}));

beforeEach(() => {
  sessionStorage.clear();
  searchParams = new URLSearchParams();
});

describe('EntranceOverlay', () => {
  it('shows once per session by default', async () => {
    render(<EntranceOverlay />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('dismisses and remembers via sessionStorage when "Enter the shop" is clicked', async () => {
    const user = userEvent.setup();
    render(<EntranceOverlay />);

    await user.click(await screen.findByRole('button', { name: 'Enter the shop' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('bacama-entrance-seen')).toBe('1');
  });

  it('dismisses via Skip', async () => {
    const user = userEvent.setup();
    render(<EntranceOverlay />);

    await user.click(await screen.findByRole('button', { name: 'Skip' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not reappear once already seen this session', () => {
    sessionStorage.setItem('bacama-entrance-seen', '1');
    render(<EntranceOverlay />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows again when forced via the ?enter search param', async () => {
    sessionStorage.setItem('bacama-entrance-seen', '1');
    searchParams = new URLSearchParams('?enter');
    render(<EntranceOverlay />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
