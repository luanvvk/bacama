jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: { findMany: jest.fn(), updateMany: jest.fn() },
    bakeryItem: { findMany: jest.fn() },
    menuItem: { findMany: jest.fn() },
    site: { findFirst: jest.fn() },
    order: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

import { createOrder, OrderValidationError } from '../create-order';

const mockProductFindMany = prisma.product.findMany as jest.Mock;
const mockProductUpdateMany = prisma.product.updateMany as jest.Mock;
const mockBakeryFindMany = prisma.bakeryItem.findMany as jest.Mock;
const mockMenuFindMany = prisma.menuItem.findMany as jest.Mock;
const mockSiteFindFirst = prisma.site.findFirst as jest.Mock;
const mockOrderCreate = prisma.order.create as jest.Mock;
const mockTransaction = prisma.$transaction as jest.Mock;

const PRODUCT = {
  id: 'p1',
  nameVi: 'Arabica',
  nameEn: 'Arabica',
  priceVnd: 185000,
  stock: 10,
};

const BAKERY_ITEM = {
  id: 'b1',
  siteId: 'site-1',
  nameVi: 'Bánh Croissant',
  nameEn: 'Croissant',
  priceVnd: 45000,
};

const BASE_INPUT = {
  customerName: 'Lê Thị Ngọc',
  phone: '0905123456',
  email: 'ngoc@example.com',
  paymentMethod: 'zalopay' as const,
  deliveryOption: 'ghn',
  address: '27 Ngô Quyền, Hải Châu, Đà Nẵng',
  province: 'Đà Nẵng',
  locale: 'vi' as const,
};

beforeEach(() => {
  mockProductFindMany.mockResolvedValue([]);
  mockProductUpdateMany.mockResolvedValue({ count: 1 });
  mockBakeryFindMany.mockResolvedValue([]);
  mockMenuFindMany.mockResolvedValue([]);
  mockSiteFindFirst.mockResolvedValue({ id: 'site-1' });
  mockOrderCreate.mockImplementation(({ data }) =>
    Promise.resolve({ id: 'order-1', ref: data.ref }),
  );
  mockTransaction.mockImplementation((callback) => callback(prisma));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('createOrder', () => {
  it('throws when the cart is empty', async () => {
    await expect(createOrder({ ...BASE_INPUT, items: [] })).rejects.toThrow(OrderValidationError);
  });

  it('re-prices from the live product record, ignoring any client-supplied price', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({ ...BASE_INPUT, items: [{ id: 'p1', quantity: 2 }] });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotalVnd: 370000,
          totalVnd: 370000,
          items: { create: [expect.objectContaining({ productId: 'p1', unitPriceVnd: 185000 })] },
        }),
      }),
    );
  });

  it('snapshots the item name in the requested locale', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({ ...BASE_INPUT, locale: 'en', items: [{ id: 'p1', quantity: 1 }] });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          items: { create: [expect.objectContaining({ nameSnapshot: 'Arabica' })] },
        }),
      }),
    );
  });

  it('throws when a product no longer exists or is inactive', async () => {
    mockProductFindMany.mockResolvedValue([]);

    await expect(
      createOrder({ ...BASE_INPUT, items: [{ id: 'missing', quantity: 1 }] }),
    ).rejects.toThrow(OrderValidationError);
  });

  it('throws when the requested quantity exceeds live stock', async () => {
    mockProductFindMany.mockResolvedValue([{ ...PRODUCT, stock: 1 }]);

    await expect(
      createOrder({ ...BASE_INPUT, items: [{ id: 'p1', quantity: 2 }] }),
    ).rejects.toThrow(OrderValidationError);
  });

  it('forces pickup and derives pickupSiteId from a bakery item, regardless of the requested deliveryOption', async () => {
    mockBakeryFindMany.mockResolvedValue([BAKERY_ITEM]);

    await createOrder({
      ...BASE_INPUT,
      deliveryOption: 'ghn',
      items: [{ id: 'b1', kind: 'bakery', quantity: 1 }],
    });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deliveryMode: 'pickup',
          pickupSiteId: 'site-1',
          addressLine: null,
          province: null,
        }),
      }),
    );
  });

  it('throws when pickup items belong to more than one café', async () => {
    mockBakeryFindMany.mockResolvedValue([BAKERY_ITEM]);
    mockMenuFindMany.mockResolvedValue([
      { id: 'm1', siteId: 'site-2', nameVi: 'Cà phê', nameEn: 'Coffee', priceVnd: 30000 },
    ]);

    await expect(
      createOrder({
        ...BASE_INPUT,
        items: [
          { id: 'b1', kind: 'bakery', quantity: 1 },
          { id: 'm1', kind: 'menu', quantity: 1 },
        ],
      }),
    ).rejects.toThrow(OrderValidationError);
  });

  it('resolves the default business site for a manually-chosen pickup with no site-scoped items', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);
    mockSiteFindFirst.mockResolvedValue({ id: 'ly-tu-trong-id' });

    await createOrder({
      ...BASE_INPUT,
      deliveryOption: 'pickup',
      items: [{ id: 'p1', quantity: 1 }],
    });

    expect(mockSiteFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'ly-tu-trong', isActive: true } }),
    );
    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deliveryMode: 'pickup', pickupSiteId: 'ly-tu-trong-id' }),
      }),
    );
  });

  it('throws when home delivery is missing an address or province', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await expect(
      createOrder({
        ...BASE_INPUT,
        address: undefined,
        items: [{ id: 'p1', quantity: 1 }],
      }),
    ).rejects.toThrow(OrderValidationError);
  });

  it('creates a COD order as awaiting_cod', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({ ...BASE_INPUT, paymentMethod: 'cod', items: [{ id: 'p1', quantity: 1 }] });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'awaiting_cod' }) }),
    );
  });

  it('decrements stock immediately for a COD order, inside a transaction', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({ ...BASE_INPUT, paymentMethod: 'cod', items: [{ id: 'p1', quantity: 3 }] });

    expect(mockTransaction).toHaveBeenCalled();
    expect(mockProductUpdateMany).toHaveBeenCalledWith({
      where: { id: 'p1', stock: { gte: 3 } },
      data: { stock: { decrement: 3 } },
    });
  });

  it('does not decrement stock for a non-COD order (waits for payment confirmation)', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({
      ...BASE_INPUT,
      paymentMethod: 'zalopay',
      items: [{ id: 'p1', quantity: 1 }],
    });

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockProductUpdateMany).not.toHaveBeenCalled();
  });

  it('throws when stock sold out between validation and the COD decrement', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);
    mockProductUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      createOrder({ ...BASE_INPUT, paymentMethod: 'cod', items: [{ id: 'p1', quantity: 1 }] }),
    ).rejects.toThrow(OrderValidationError);
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });

  it('creates a non-COD order as pending', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({
      ...BASE_INPUT,
      paymentMethod: 'zalopay',
      items: [{ id: 'p1', quantity: 1 }],
    });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'pending' }) }),
    );
  });

  it.each([
    ['zalopay', 'zalopay'],
    ['momo', 'momo'],
    ['vnpay', 'vnpay_qr'],
    ['bank', 'bank_transfer'],
    ['card', 'card'],
    ['cod', 'cod'],
  ] as const)('maps checkout payment method %s to the Prisma enum %s', async (input, expected) => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    await createOrder({ ...BASE_INPUT, paymentMethod: input, items: [{ id: 'p1', quantity: 1 }] });

    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ paymentProvider: expected }) }),
    );
  });

  it('returns the created order id and ref', async () => {
    mockProductFindMany.mockResolvedValue([PRODUCT]);

    const result = await createOrder({ ...BASE_INPUT, items: [{ id: 'p1', quantity: 1 }] });

    expect(result).toEqual({ id: 'order-1', ref: expect.stringMatching(/^BCM-[0-9A-F]{8}$/) });
  });
});
