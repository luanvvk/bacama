import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocale } from 'next-intl';

import { LocaleToggle } from '../index';

const refresh = jest.fn();
const mockUseLocale = useLocale as jest.Mock;

jest.mock('next-intl', () => ({
  useLocale: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

beforeEach(() => {
  mockUseLocale.mockReturnValue('vi');
});

afterEach(() => {
  refresh.mockClear();
  document.cookie = 'NEXT_LOCALE=; path=/; max-age=0';
});

describe('LocaleToggle', () => {
  it('marks the active locale as pressed', () => {
    render(<LocaleToggle />);

    expect(screen.getByRole('button', { name: 'vi' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets the locale cookie and refreshes when switching', async () => {
    render(<LocaleToggle />);

    await userEvent.click(screen.getByRole('button', { name: 'en' }));

    expect(document.cookie).toContain('NEXT_LOCALE=en');
    expect(refresh).toHaveBeenCalled();
  });

  it('does nothing when clicking the already-active locale', async () => {
    render(<LocaleToggle />);

    await userEvent.click(screen.getByRole('button', { name: 'vi' }));

    expect(refresh).not.toHaveBeenCalled();
  });
});
