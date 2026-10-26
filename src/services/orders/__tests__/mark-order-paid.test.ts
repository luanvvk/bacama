jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: { findUnique: jest.fn(), updateMany: jest.fn() },
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

  it('keeps the order paid when stock is short', async () => {
    mockFindUnique.mockResolvedValue(orderWith([{ productId: 'p1', quantity: 9 }]));
    mockProductUpdateMany.mockResolvedValue({ count: 0 });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await markOrderPaid('r')).toBe('updated');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('returns not_found and amount_mismatch without writing', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    expect(await markOrderPaid('r')).toBe('not_found');
    mockFindUnique.mockResolvedValueOnce(orderWith([]));
    expect(await markOrderPaid('r', 99)).toBe('amount_mismatch');
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
