import type { ShipmentStatus } from '@/generated/prisma/client';

type BadgeVariant = 'warning' | 'destructive' | 'success' | 'outline';

export const shipmentStatusBadge = (
  status: ShipmentStatus,
): { label: string; variant: BadgeVariant } => {
  switch (status) {
    case 'created':
      return { label: 'Awaiting pickup', variant: 'outline' };
    case 'picked_up':
      return { label: 'Picked up', variant: 'warning' };
    case 'in_transit':
      return { label: 'In transit', variant: 'warning' };
    case 'delivered':
      return { label: 'Delivered', variant: 'success' };
    case 'failed':
      return { label: 'Delivery failed', variant: 'destructive' };
  }
};
