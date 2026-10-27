import { signFakeWebhook, fakeProvider } from '@/lib/providers/payment/__tests__/fake-provider';

interface StoredOrder {
  id: string;
  ref: string;
  providerRef: string | null;
  status: string;
  totalVnd: number;
  items: { productId: string | null; quantity: number }[];
}

const orders: StoredOrder[] = [];

jest.mock('@/lib/prisma', () => {
  const client: Record<string, unknown> = {
    product: {
      findMany: jest.fn(async () => [
        { id: 'p1', nameVi: 'A', nameEn: 'A', priceVnd: 100, stock: 10 },
      ]),
      updateMany: jest.fn(async () => ({ count: 1 })),
    },
    bakeryItem: { findMany: jest.fn() },
    menuItem: { findMany: jest.fn() },
    site: { findFirst: jest.fn() },
    order: {
      create: jest.fn(async ({ data }) => {
        const order = {
          id: 'o1',
          ref: data.ref,
          providerRef: null,
          status: data.status,
          totalVnd: data.totalVnd,
          items: data.items.create,
        };
        orders.push(order);
        return { id: order.id, ref: order.ref };
      }),
      update: jest.fn(async ({ where, data }) => {
        Object.assign(
          orders.find((o) => o.id === where.id)!,
          data,
        );
      }),
      findUnique: jest.fn(
        async ({ where }) => orders.find((o) => o.providerRef === where.providerRef) ?? null,
      ),
      updateMany: jest.fn(async ({ where, data }) => {
        const order = orders.find((o) => o.id === where.id && o.status === where.status);
        if (order) Object.assign(order, data);
        return { count: order ? 1 : 0 };
      }),
    },
    $transaction: jest.fn(async (fn: (tx: unknown) => unknown) => fn(client)),
  };
  return { prisma: client };
});

jest.mock('@/lib/providers/payment', () => ({
  getPaymentProviderByMethod: () => ({
    pay: async (_amount: number, orderRef: string) => ({
      provider: 'zalopay',
      providerRef: `gw-${orderRef}`,
      redirectUrl: '/pay',
    }),
  }),
  PaymentMethodUnavailableError: class extends Error {},
}));

import { createOrder } from '../create-order';
import { markOrderPaid } from '../mark-order-paid';

it('a paid webhook finds the order created for the payment session', async () => {
  const { ref } = await createOrder({
    items: [{ id: 'p1', quantity: 2 }],
    customerName: 'N',
    phone: '0905123456',
    email: 'n@example.com',
    paymentMethod: 'zalopay',
    deliveryOption: 'ghn',
    address: 'addr',
    province: 'prov',
    locale: 'en',
  });

  const body = Buffer.from(
    JSON.stringify({ providerRef: `gw-${ref}`, status: 'paid', amountVnd: 200 }),
  );
  const event = fakeProvider.parseWebhook(body, { 'x-signature': signFakeWebhook(body) });

  expect(await markOrderPaid(event.providerRef, event.amountVnd)).toBe('updated');
  expect(orders[0].status).toBe('paid');
  expect(await markOrderPaid(event.providerRef, event.amountVnd)).toBe('already_processed');
});
