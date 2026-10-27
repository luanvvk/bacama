import type { CheckoutOrder } from '@/stores/checkout';
import type { Prisma } from '@/generated/prisma/client';

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

/** Maps a persisted Order + OrderItem rows back into the shape the
 * checkout/confirmation UI already renders (CheckoutOrder), so real orders
 * and the still-simulated client-only flow can share the same components. */
export const mapOrderToCheckoutOrder = (order: OrderWithItems): CheckoutOrder => ({
  orderRef: order.ref,
  items: order.items.map((item) => ({
    id: item.id,
    name: item.nameSnapshot,
    priceVnd: item.unitPriceVnd,
    quantity: item.quantity,
    options: [item.weight, item.grind].filter(Boolean).join(' · ') || undefined,
  })),
  subtotalVnd: order.subtotalVnd,
  totalVnd: order.totalVnd,
  paymentMethod: order.paymentProvider ?? 'cod',
  shipping: {
    fullName: order.customerName,
    phone: order.phone,
    email: order.email ?? '',
    address: order.addressLine ?? '',
    province: order.province ?? '',
    deliveryOption: order.deliveryMode === 'pickup' ? 'pickup' : 'ghn',
  },
});
