jest.mock('@/lib/prisma', () => ({
  prisma: { order: { findUnique: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getOrderByRef } from '../get-order-by-ref';

const mockFindUnique = prisma.order.findUnique as jest.Mock;

const ORDER = {
  ref: 'BCM-ABCD1234',
  customerName: 'Test Buyer',
  phone: '0905999888',
  email: 'test@example.com',
  addressLine: '123 Test Street',
  province: 'Đà Nẵng',
  deliveryMode: 'home_delivery',
  subtotalVnd: 185000,
  totalVnd: 185000,
  paymentProvider: 'cod',
  items: [
    {
      id: 'oi1',
      nameSnapshot: '250g Bag · Arabica',
      unitPriceVnd: 185000,
      quantity: 1,
      weight: '250g',
      grind: 'whole_bean',
    },
  ],
};

describe('getOrderByRef', () => {
  afterEach(() => {
    mockFindUnique.mockReset();
  });

  it('queries by ref, including items', async () => {
    mockFindUnique.mockResolvedValue(null);

    await getOrderByRef('BCM-ABCD1234');

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { ref: 'BCM-ABCD1234' },
      include: { items: true },
    });
  });

  it('returns null when no order matches', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getOrderByRef('nope')).resolves.toBeNull();
  });

  it('maps a found order to the CheckoutOrder shape', async () => {
    mockFindUnique.mockResolvedValue(ORDER);

    const result = await getOrderByRef('BCM-ABCD1234');

    expect(result).toEqual({
      orderRef: 'BCM-ABCD1234',
      items: [
        {
          id: 'oi1',
          name: '250g Bag · Arabica',
          priceVnd: 185000,
          quantity: 1,
          options: '250g · whole_bean',
        },
      ],
      subtotalVnd: 185000,
      totalVnd: 185000,
      paymentMethod: 'cod',
      shipping: {
        fullName: 'Test Buyer',
        phone: '0905999888',
        email: 'test@example.com',
        address: '123 Test Street',
        province: 'Đà Nẵng',
        deliveryOption: 'ghn',
      },
    });
  });

  it('maps deliveryMode pickup to deliveryOption pickup', async () => {
    mockFindUnique.mockResolvedValue({ ...ORDER, deliveryMode: 'pickup' });

    const result = await getOrderByRef('BCM-ABCD1234');

    expect(result?.shipping.deliveryOption).toBe('pickup');
  });

  it.each([
    ['zalopay', 'zalopay'],
    ['momo', 'momo'],
    ['vnpay_qr', 'vnpay'],
    ['bank_transfer', 'bank'],
    ['card', 'card'],
    ['cod', 'cod'],
  ] as const)('maps the Prisma payment enum %s back to %s', async (stored, expected) => {
    mockFindUnique.mockResolvedValue({ ...ORDER, paymentProvider: stored });

    const result = await getOrderByRef('BCM-ABCD1234');

    expect(result?.paymentMethod).toBe(expected);
  });
});
