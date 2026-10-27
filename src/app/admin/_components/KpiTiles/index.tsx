import { useTranslations } from 'next-intl';

import { formatVnd } from '@/lib/format-price';
import { cn } from '@/lib/utils';
import type { AdminKpis } from '@/services/orders/get-admin-kpis';

interface Tile {
  key: string;
  value: string;
  delta: string | null;
  deltaPositive: boolean;
}

const signed = (value: number) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

export const KpiTiles = ({ kpis }: { kpis: AdminKpis }) => {
  const t = useTranslations('Admin.overview.kpis');

  const tiles: Tile[] = [
    {
      key: 'orders',
      value: String(kpis.ordersToday),
      delta: kpis.ordersDelta === null ? null : signed(kpis.ordersDelta),
      deltaPositive: (kpis.ordersDelta ?? 0) >= 0,
    },
    {
      key: 'revenue',
      value: formatVnd(kpis.revenueTodayVnd),
      delta: kpis.revenueDeltaPercent === null ? null : `${signed(kpis.revenueDeltaPercent)}%`,
      deltaPositive: (kpis.revenueDeltaPercent ?? 0) >= 0,
    },
    {
      key: 'awaiting',
      value: String(kpis.awaitingDespatch),
      delta: null,
      deltaPositive: true,
    },
    {
      key: 'signUps',
      value: String(kpis.signUpsLast7Days),
      delta: kpis.signUpsDelta === null ? null : signed(kpis.signUpsDelta),
      deltaPositive: (kpis.signUpsDelta ?? 0) >= 0,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.key} className="rounded-lg border p-4">
          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
            {t(`${tile.key}.label`)}
          </p>
          <p className="font-heading mt-1.5 text-3xl font-semibold">{tile.value}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {tile.delta && (
              <b className={cn(tile.deltaPositive ? 'text-success' : 'text-destructive')}>
                {tile.delta}{' '}
              </b>
            )}
            {t(`${tile.key}.detail`)}
          </p>
        </div>
      ))}
    </div>
  );
};
