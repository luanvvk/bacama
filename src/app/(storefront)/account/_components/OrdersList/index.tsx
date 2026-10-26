import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Typography';
import { formatVnd } from '@/lib/format-price';
import type { AccountOrder } from '@/services/orders/get-orders-for-user';

interface OrdersListProps {
  orders: AccountOrder[];
}

export const OrdersList = ({ orders }: OrdersListProps) => {
  const t = useTranslations('Account');
  const tStatus = useTranslations('OrderStatus');
  const format = useFormatter();

  if (orders.length === 0) {
    return (
      <div className="mt-8">
        <Text className="text-muted-foreground">{t('empty')}</Text>
        <Button asChild size="lg" className="mt-4">
          <Link href="/shop">{t('shop')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
      {orders.map((order) => (
        <li key={order.ref} className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <Text className="font-medium">{order.ref}</Text>
            <Text className="text-muted-foreground text-sm">
              {format.dateTime(order.createdAt, { dateStyle: 'medium' })}
            </Text>
            <Text className="text-muted-foreground mt-1 text-sm">{order.itemNames.join(', ')}</Text>
          </div>
          <div className="text-right">
            <Text className="font-medium">{formatVnd(order.totalVnd)}</Text>
            <Text className="text-muted-foreground text-sm">{tStatus(order.status)}</Text>
          </div>
        </li>
      ))}
    </ul>
  );
};
