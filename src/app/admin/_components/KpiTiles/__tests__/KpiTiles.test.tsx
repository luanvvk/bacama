import { render, screen } from '@testing-library/react';

import type { AdminKpis } from '@/services/orders/get-admin-kpis';

import { KpiTiles } from '../index';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const kpis: AdminKpis = {
  ordersToday: 14,
  ordersDelta: 3,
  revenueTodayVnd: 4_200_000,
  revenueDeltaPercent: 11,
  awaitingDespatch: 9,
  signUpsLast7Days: 6,
  signUpsDelta: -2,
};

describe('KpiTiles', () => {
  it('renders the figures with signed deltas', () => {
    render(<KpiTiles kpis={kpis} />);

    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('4.200.000 ₫')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.getByText('+11%')).toBeInTheDocument();
    expect(screen.getByText('−2')).toBeInTheDocument();
  });

  it('omits deltas when there is no baseline', () => {
    render(
      <KpiTiles
        kpis={{ ...kpis, ordersDelta: null, revenueDeltaPercent: null, signUpsDelta: null }}
      />,
    );

    expect(screen.queryByText(/^[+−]/)).not.toBeInTheDocument();
  });
});
