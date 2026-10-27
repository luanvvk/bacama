const tx = {
  order: { updateMany: jest.fn() },
  product: { update: jest.fn() },
};
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findMany: jest.fn() },
    $transaction: jest.fn((fn: (t: typeof tx) => unknown) => fn(tx)),
  },
}));

import { prisma } from '@/lib/prisma';

import { DEFAULT_COD_ORDER_TTL_DAYS, expireAwaitingCodOrders } from '../expire-awaiting-cod-orders';

const mockFindMany = prisma.order.findMany as jest.Mock;
const now = new Date('2026-01-10T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.COD_ORDER_TTL_DAYS;
});

describe('expireAwaitingCodOrders', () => {
  it('selects awaiting_cod orders older than the default window', async () => {
    mockFindMany.mockResolvedValue([]);
    await expireAwaitingCodOrders(now);
    expect(mockFindMany.mock.calls[0][0].where).toEqual({
      status: 'awaiting_cod',
      createdAt: { lt: new Date(now.getTime() - DEFAULT_COD_ORDER_TTL_DAYS * DAY) },
    });
  });

  it('reads the window from COD_ORDER_TTL_DAYS', async () => {
    process.env.COD_ORDER_TTL_DAYS = '7';
    mockFindMany.mockResolvedValue([]);
    await expireAwaitingCodOrders(now);
    expect(mockFindMany.mock.calls[0][0].where.createdAt).toEqual({
      lt: new Date(now.getTime() - 7 * DAY),
    });
  });

  it('fails the order and returns stock for product lines only', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'o1',
        items: [
          { productId: 'p1', quantity: 3 },
          { productId: null, quantity: 2 },
        ],
      },
    ]);
    tx.order.updateMany.mockResolvedValue({ count: 1 });

    await expect(expireAwaitingCodOrders(now)).resolves.toEqual({ expired: 1 });

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'o1', status: 'awaiting_cod' },
      data: { status: 'failed' },
    });
    expect(tx.product.update).toHaveBeenCalledTimes(1);
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stock: { increment: 3 } },
    });
  });

  it('returns no stock when the order was already moved on', async () => {
    mockFindMany.mockResolvedValue([{ id: 'o1', items: [{ productId: 'p1', quantity: 3 }] }]);
    tx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(expireAwaitingCodOrders(now)).resolves.toEqual({ expired: 0 });
    expect(tx.product.update).not.toHaveBeenCalled();
  });
});
