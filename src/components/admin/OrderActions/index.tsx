'use client';

import { useRouter } from 'next/navigation';
import { useState, type ComponentProps } from 'react';

import { Button } from '@/components/ui';
import { toast } from '@/lib/toast';

type OrderAction = 'acknowledge' | 'collect-cod';

const SUCCESS: Record<OrderAction, string> = {
  acknowledge: 'Order acknowledged.',
  'collect-cod': 'COD marked as collected.',
};

export const OrderActionButton = ({
  orderRef,
  action,
  children,
  ...props
}: { orderRef: string; action: OrderAction } & Omit<
  ComponentProps<typeof Button>,
  'onClick' | 'disabled'
>) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderRef)}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) {
        toast(response.status === 409 ? 'This order has already changed.' : 'Action failed.');
      } else {
        toast(SUCCESS[action]);
      }
      router.refresh();
    } catch {
      toast('Action failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <Button {...props} disabled={pending} onClick={run}>
      {children}
    </Button>
  );
};

export const PrintButton = ({ children }: { children: React.ReactNode }) => (
  <Button variant="outline" onClick={() => window.print()}>
    {children}
  </Button>
);
