jest.mock('@/lib/prisma', () => ({
  prisma: { order: { findUnique: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { canShowOrderDone, getOrderStatus } from '../get-order-status';

const mockFindUnique = prisma.order.findUnique as jest.Mock;

describe('getOrderStatus', () => {
  afterEach(() => mockFindUnique.mockReset());

  it('selects only the status column', async () => {
    mockFindUnique.mockResolvedValue({ status: 'paid' });

    await expect(getOrderStatus('BCM-ABCD1234')).resolves.toBe('paid');
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { ref: 'BCM-ABCD1234' },
      select: { status: true },
    });
  });

  it('returns null when no order matches', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getOrderStatus('nope')).resolves.toBeNull();
  });
});

describe('canShowOrderDone', () => {
  it.each([
    ['paid', true],
    ['awaiting_cod', true],
    ['pending', false],
    ['failed', false],
    ['shipped', true],
    ['delivered', true],
    ['completed', true],
    ['refunded', true],
  ] as const)('%s -> %s', (status, expected) => {
    expect(canShowOrderDone(status)).toBe(expected);
  });
});
