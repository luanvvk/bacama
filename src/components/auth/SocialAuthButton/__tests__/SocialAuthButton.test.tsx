import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SocialAuthButton } from '../index';
import { toast } from '@/lib/toast';

const MESSAGES: Record<string, string> = {
  continueWithGoogle: 'Continue with Google',
  googleNotWired: "Google sign-in isn't wired up yet.",
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));
jest.mock('@/lib/toast', () => ({ toast: jest.fn() }));

describe('SocialAuthButton', () => {
  it('shows a toast instead of a real Google sign-in', async () => {
    render(<SocialAuthButton />);

    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(toast).toHaveBeenCalledWith("Google sign-in isn't wired up yet.");
  });
});
