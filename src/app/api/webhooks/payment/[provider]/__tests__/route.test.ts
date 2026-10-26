/** @jest-environment node */
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: jest.fn(), updateMany: jest.fn() },
    product: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock('@/lib/providers/payment', () => {
  const actual = jest.requireActual('@/lib/providers/payment');
  const { fakeProvider } = jest.requireActual('@/lib/providers/payment/__tests__/fake-provider');
  return { ...actual, getPaymentProviderByMethod: () => fakeProvider };
});

import { prisma } from '@/lib/prisma';
import {
  FAKE_WEBHOOK_SECRET,
  signFakeWebhook,
} from '@/lib/providers/payment/__tests__/fake-provider';

import { POST } from '../route';

const mockFindUnique = prisma.order.findUnique as jest.Mock;
const mockOrderUpdateMany = prisma.order.updateMany as jest.Mock;
const mockProductUpdateMany = prisma.product.updateMany as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;

const ORDER = {
  id: 'o1',
  ref: 'BCM-AAAA',
  totalVnd: 200000,
  items: [
    { productId: 'p1', quantity: 2 },
    { productId: null, quantity: 1 },
  ],
};

const send = (
  body: object,
  { provider = 'zalopay', signature }: { provider?: string; signature?: string } = {},
) => {
  const raw = JSON.stringify(body);
  const request = new Request('http://localhost/api/webhooks/payment/x', {
    method: 'POST',
    body: raw,
    headers: { 'x-signature': signature ?? signFakeWebhook(raw) },
  });
  return POST(request as never, { params: Promise.resolve({ provider }) });
};

const prismaCalls = () =>
  mockFindUnique.mock.calls.length +
  mockOrderUpdateMany.mock.calls.length +
  mockProductUpdateMany.mock.calls.length +
  mockTransaction.mock.calls.length;

beforeEach(() => {
  jest.resetAllMocks();
  mockFindUnique.mockResolvedValue(ORDER);
  mockOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockProductUpdateMany.mockResolvedValue({ count: 1 });
  mockTransaction.mockImplementation((fn) => fn(prisma));
});

describe('POST /api/webhooks/payment/[provider]', () => {
  it('returns 404 for an unknown provider segment without touching the database', async () => {
    const response = await send({ providerRef: 'r1', status: 'paid' }, { provider: 'nope' });
    expect(response.status).toBe(404);
    expect(prismaCalls()).toBe(0);
  });

  it('returns 404 for cod', async () => {
    const response = await send({ providerRef: 'r1', status: 'paid' }, { provider: 'cod' });
    expect(response.status).toBe(404);
    expect(prismaCalls()).toBe(0);
  });

  it('returns 401 for a bad signature without touching the database', async () => {
    const response = await send({ providerRef: 'r1', status: 'paid' }, { signature: 'bad' });
    expect(response.status).toBe(401);
    expect(prismaCalls()).toBe(0);
  });

  it('marks a pending order paid and decrements stock once', async () => {
    const response = await send({ providerRef: 'r1', status: 'paid', amountVnd: 200000 });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(mockOrderUpdateMany).toHaveBeenCalledWith({
      where: { id: 'o1', status: 'pending' },
      data: { status: 'paid', paidAt: expect.any(Date) },
    });
    expect(mockProductUpdateMany).toHaveBeenCalledTimes(1);
    expect(mockProductUpdateMany).toHaveBeenCalledWith({
      where: { id: 'p1', stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
  });

  it('treats a replay as already processed and does not decrement', async () => {
    mockOrderUpdateMany.mockResolvedValue({ count: 0 });
    const response = await send({ providerRef: 'r1', status: 'paid' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, alreadyProcessed: true });
    expect(mockProductUpdateMany).not.toHaveBeenCalled();
  });

  it('keeps the order paid and warns with the ref only when stock is short', async () => {
    mockProductUpdateMany.mockResolvedValue({ count: 0 });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const response = await send({ providerRef: 'r1', status: 'paid' });
    expect(response.status).toBe(200);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls)).toContain('BCM-AAAA');
    warn.mockRestore();
  });

  it('rejects a mismatched amount and leaves the order unchanged', async () => {
    const response = await send({ providerRef: 'r1', status: 'paid', amountVnd: 1 });
    expect(response.status).toBe(400);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockOrderUpdateMany).not.toHaveBeenCalled();
  });

  it('moves pending to failed', async () => {
    const response = await send({ providerRef: 'r1', status: 'failed' });
    expect(response.status).toBe(200);
    expect(mockOrderUpdateMany).toHaveBeenCalledWith({
      where: { id: 'o1', status: 'pending' },
      data: { status: 'failed' },
    });
    expect(mockProductUpdateMany).not.toHaveBeenCalled();
  });

  it('treats a pending status as a no-op', async () => {
    const response = await send({ providerRef: 'r1', status: 'pending' });
    expect(response.status).toBe(200);
    expect(prismaCalls()).toBe(0);
  });

  it('returns a generic 404 for an unknown providerRef', async () => {
    mockFindUnique.mockResolvedValue(null);
    const response = await send({ providerRef: 'missing', status: 'paid' });
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not found' });
  });

  it('never logs the body, headers or secret', async () => {
    const spies = (['log', 'info', 'warn', 'error'] as const).map((m) =>
      jest.spyOn(console, m).mockImplementation(() => {}),
    );
    await send({ providerRef: 'r1', status: 'paid', amountVnd: 200000 });
    await send({ providerRef: 'r1', status: 'paid' }, { signature: 'bad' });
    const logged = JSON.stringify(spies.flatMap((s) => s.mock.calls));
    expect(logged).not.toContain(FAKE_WEBHOOK_SECRET);
    expect(logged).not.toContain('providerRef');
    expect(logged).not.toContain('x-signature');
    spies.forEach((s) => s.mockRestore());
  });
});
