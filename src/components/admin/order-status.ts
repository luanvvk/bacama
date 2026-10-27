import type { OrderStatus, PaymentMethod } from '@/generated/prisma/client';

type BadgeVariant = 'warning' | 'destructive' | 'success' | 'secondary';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  zalopay: 'ZaloPay',
  momo: 'MoMo',
  vnpay_qr: 'VNPay QR',
  bank_transfer: 'Bank',
  card: 'Card',
  cod: 'COD',
};

export const paymentLabel = (method: PaymentMethod | null): string =>
  method ? PAYMENT_LABELS[method] : '—';

export const orderStatusBadge = (order: {
  status: OrderStatus;
  acknowledgedAt: Date | null;
}): { label: string; variant: BadgeVariant } => {
  switch (order.status) {
    case 'paid':
      return order.acknowledgedAt
        ? { label: 'Acknowledged', variant: 'success' }
        : { label: 'To acknowledge', variant: 'warning' };
    case 'awaiting_cod':
      return { label: 'Awaiting COD', variant: 'warning' };
    case 'pending':
      return { label: 'Awaiting payment', variant: 'warning' };
    case 'failed':
      return { label: 'Payment failed', variant: 'destructive' };
    case 'needs_review':
      return { label: 'Needs review', variant: 'destructive' };
    case 'shipped':
      return { label: 'Shipped', variant: 'success' };
    case 'delivered':
      return { label: 'Delivered', variant: 'success' };
    case 'completed':
      return { label: 'Completed', variant: 'success' };
    case 'refunded':
      return { label: 'Refunded', variant: 'secondary' };
  }
};
