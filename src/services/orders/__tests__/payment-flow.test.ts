/** @jest-environment node */
import { signFakeWebhook } from '@/lib/providers/payment/__tests__/fake-provider';

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
  getPaymentProviderByMethod: () =>
    jest.requireActual('@/lib/providers/payment/__tests__/fake-provider').fakeProvider,
  PaymentMethodUnavailableError: class extends Error {},
}));

import { POST } from '@/app/api/webhooks/payment/[provider]/route';

import { prisma } from '@/lib/prisma';

import { createOrder } from '../create-order';

const webhook = (body: Buffer) =>
  POST(
    new Request('http://localhost/api/webhooks/payment/zalopay', {
      method: 'POST',
      body: new Uint8Array(body),
      headers: { 'x-signature': signFakeWebhook(body) },
    }) as never,
    { params: Promise.resolve({ provider: 'zalopay' }) },
  );

it('a signed paid webhook finds the order created for the payment session', async () => {
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
    JSON.stringify({ providerRef: `fake-${ref}`, status: 'paid', amountVnd: 200 }),
  );

  const first = await webhook(body);
  expect(first.status).toBe(200);
  expect(orders[0].status).toBe('paid');

  const replay = await webhook(body);
  expect(await replay.json()).toEqual({ received: true, alreadyProcessed: true });
  expect(prisma.product.updateMany).toHaveBeenCalledTimes(1);
  expect(prisma.product.updateMany).toHaveBeenCalledWith({
    where: { id: 'p1', stock: { gte: 2 } },
    data: { stock: { decrement: 2 } },
  });
});
