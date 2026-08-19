import { render, screen } from '@testing-library/react';

import { Footer } from '../index';

const MESSAGES: Record<string, string> = {
  tagline: 'Small roastery, daily batches, an early bake — Đà Nẵng, 2017.',
  'columns.coffee': 'Coffee',
  'columns.workshops': 'Workshops',
  'columns.helpInfo': 'Help & info',
  'columns.moreBacama': 'More Bacama',
  'columns.contact': 'Contact',
  copyright: '© 2026 Bacama · Đà Nẵng business licence 0300/2026',
  paymentMethods: 'ZaloPay · MoMo · VNPay · COD · GHN',
};

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => MESSAGES[key],
}));

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
