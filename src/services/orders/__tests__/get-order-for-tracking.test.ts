jest.mock('@/lib/prisma', () => ({
  prisma: { order: { findUnique: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getOrderForTracking } from '../get-order-for-tracking';

const mockFindUnique = prisma.order.findUnique as jest.Mock;

const ORDER = {
  ref: 'BCM-ABCD1234',
  customerName: 'Test Buyer',
  phone: '0905 999 888',
  email: 'test@example.com',
  addressLine: '123 Test Street',
  province: 'Đà Nẵng',
  deliveryMode: 'home_delivery',
  subtotalVnd: 185000,
  totalVnd: 185000,
  paymentProvider: 'cod',
  items: [],
};

describe('getOrderForTracking', () => {
  afterEach(() => {
    mockFindUnique.mockReset();
  });

  it('returns null when no order matches the ref', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(getOrderForTracking('nope', '0905999888')).resolves.toBeNull();
  });

  it('returns null when the phone does not match', async () => {
    mockFindUnique.mockResolvedValue(ORDER);

    await expect(getOrderForTracking('BCM-ABCD1234', '0900000000')).resolves.toBeNull();
  });

  it('matches phone numbers ignoring formatting (spaces, dashes)', async () => {
    mockFindUnique.mockResolvedValue(ORDER);

    const result = await getOrderForTracking('BCM-ABCD1234', '0905-999-888');

    expect(result).not.toBeNull();
    expect(result?.orderRef).toBe('BCM-ABCD1234');
  });

  it('returns the mapped order when the phone matches exactly', async () => {
    mockFindUnique.mockResolvedValue(ORDER);

    const result = await getOrderForTracking('BCM-ABCD1234', '0905 999 888');

    expect(result?.shipping.phone).toBe('0905 999 888');
  });
});
