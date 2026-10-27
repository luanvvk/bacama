/** @jest-environment node */
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

import { PATCH } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import { updateProduct } from '@/services/catalog/update-product';

jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/services/catalog/update-product', () => ({
  ...jest.requireActual('@/services/catalog/update-product'),
  updateProduct: jest.fn(),
}));

const getCurrentUser = jest.fn();
const update = jest.mocked(updateProduct);

const patch = (body: unknown, id = 'p1') =>
  PATCH(
    new NextRequest(`http://localhost/api/admin/products/${id}`, {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );

beforeEach(() => {
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
  getCurrentUser.mockResolvedValue({ id: 'u1', role: 'staff', homeSiteId: 'site-2' });
  update.mockResolvedValue({ id: 'p1', slug: 'dalat-washed' } as never);
});

afterEach(() => jest.resetAllMocks());

describe('PATCH /api/admin/products/[id]', () => {
  it('returns 401 for a guest without writing', async () => {
    getCurrentUser.mockResolvedValue(null);

    expect((await patch({ stock: 1 })).status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['customer', 'instructor'])('returns 403 for %s without writing', async (role) => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role });

    expect((await patch({ stock: 1 })).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it.each(['staff', 'admin'])('returns 200 for %s and revalidates the storefront', async (role) => {
    getCurrentUser.mockResolvedValue({ id: 'u1', role });

    const response = await patch({ stock: 5 });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith('p1', { stock: 5 });
    expect(revalidatePath).toHaveBeenCalledWith('/shop');
    expect(revalidatePath).toHaveBeenCalledWith('/product/dalat-washed');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('returns 400 for unknown keys, negatives, empty and malformed bodies', async () => {
    expect((await patch({ nameEn: 'Hacked' })).status).toBe(400);
    expect((await patch({ stock: 1, nameEn: 'Hacked' })).status).toBe(400);
    expect((await patch({ priceVnd: -1 })).status).toBe(400);
    expect((await patch({})).status).toBe(400);
    expect((await patch('not json')).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown id without revalidating', async () => {
    update.mockResolvedValue(null);

    expect((await patch({ stock: 5 }, 'missing')).status).toBe(404);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
