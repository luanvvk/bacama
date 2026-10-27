jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    product: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

import { markOrderPaid } from '../mark-order-paid';

const mockFindUnique = prisma.order.findUnique as jest.Mock;
const mockOrderUpdateMany = prisma.order.updateMany as jest.Mock;
const mockProductUpdateMany = prisma.product.updateMany as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;

const orderWith = (items: { productId: string | null; quantity: number }[]) => ({
  id: 'o1',
  ref: 'BCM-1',
  totalVnd: 100,
  items,
});

beforeEach(() => {
  jest.resetAllMocks();
  mockOrderUpdateMany.mockResolvedValue({ count: 1 });
  mockProductUpdateMany.mockResolvedValue({ count: 1 });
  mockTransaction.mockImplementation((fn) => fn(prisma));
});

describe('markOrderPaid', () => {
  it('decrements each product line once and ignores bakery/menu lines', async () => {
    mockFindUnique.mockResolvedValue(
      orderWith([
        { productId: 'p1', quantity: 1 },
        { productId: 'p2', quantity: 3 },
        { productId: 'p1', quantity: 2 },
        { productId: null, quantity: 5 },
      ]),
    );
    expect(await markOrderPaid('r')).toBe('updated');
    expect(mockProductUpdateMany).toHaveBeenCalledTimes(2);
    expect(mockProductUpdateMany).toHaveBeenCalledWith({
      where: { id: 'p1', stock: { gte: 3 } },
      data: { stock: { decrement: 3 } },
    });
  });

  it('does not decrement on replay', async () => {
    mockFindUnique.mockResolvedValue(orderWith([{ productId: 'p1', quantity: 1 }]));
    mockOrderUpdateMany.mockResolvedValue({ count: 0 });
    expect(await markOrderPaid('r')).toBe('already_processed');
    expect(mockProductUpdateMany).not.toHaveBeenCalled();
  });

  it('flags a paid event for an expired order as needs_review without touching stock', async () => {
    mockFindUnique.mockResolvedValue(orderWith([{ productId: 'p1', quantity: 1 }]));
    mockOrderUpdateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 1 });
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(await markOrderPaid('r')).toBe('needs_review');
    expect(mockOrderUpdateMany).toHaveBeenLastCalledWith({
      where: { id: 'o1', status: 'failed' },
      data: { status: 'needs_review', paidAt: expect.any(Date) },
    });
    expect(mockProductUpdateMany).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it('flags the order needs_review when stock is short', async () => {
    mockFindUnique.mockResolvedValue(orderWith([{ productId: 'p1', quantity: 9 }]));
    mockProductUpdateMany.mockResolvedValue({ count: 0 });
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(await markOrderPaid('r')).toBe('needs_review');
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { status: 'needs_review' },
    });
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it('returns not_found and amount_mismatch without writing', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    expect(await markOrderPaid('r')).toBe('not_found');
    mockFindUnique.mockResolvedValueOnce(orderWith([]));
    expect(await markOrderPaid('r', 99)).toBe('amount_mismatch');
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
