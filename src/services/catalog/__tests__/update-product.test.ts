jest.mock('@/lib/prisma', () => ({
  prisma: { product: { update: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { updateProduct } from '../update-product';

const mockUpdate = prisma.product.update as jest.Mock;

describe('updateProduct', () => {
  afterEach(() => mockUpdate.mockReset());

  it('writes only the fields it was given', async () => {
    mockUpdate.mockResolvedValue({ id: 'p1', slug: 's' });

    await updateProduct('p1', { priceVnd: 199000 });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { priceVnd: 199000 },
      select: { id: true, slug: true },
    });
  });

  it('stores calendar dates as Asia/Ho_Chi_Minh instants and allows clearing', async () => {
    mockUpdate.mockResolvedValue({ id: 'p1', slug: 's' });

    await updateProduct('p1', { roastDate: '2026-08-11', featuredUntil: null });

    const { data } = mockUpdate.mock.calls[0][0];
    expect(data.roastDate.toISOString()).toBe('2026-08-10T17:00:00.000Z');
    expect(data.featuredUntil).toBeNull();
  });

  it.each([
    { priceVnd: -1 },
    { stock: -5 },
    { reorderLevel: 1.5 },
    { stock: 2 ** 31 },
    { roastDate: '2026-02-30' },
    {},
    { nameEn: 'x' },
  ])('rejects invalid input %p without touching the database', async (input) => {
    await expect(updateProduct('p1', input as never)).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns null when the product does not exist', async () => {
    mockUpdate.mockRejectedValue({ code: 'P2025' });

    expect(await updateProduct('missing', { stock: 1 })).toBeNull();
  });

  it('rethrows other database errors', async () => {
    mockUpdate.mockRejectedValue(new Error('boom'));

    await expect(updateProduct('p1', { stock: 1 })).rejects.toThrow('boom');
  });
});
