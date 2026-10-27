/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST as acknowledge } from '../[ref]/acknowledge/route';
import { POST as collectCod } from '../[ref]/collect-cod/route';
import { GET as list } from '../route';
import { getAuthProvider } from '@/lib/providers/auth';
import {
  acknowledgeOrder,
  AdminOrderConflictError,
  AdminOrderNotFoundError,
  listAdminOrders,
  markCodCollected,
} from '@/services/orders/admin-orders';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/providers/auth', () => ({ getAuthProvider: jest.fn() }));
jest.mock('@/services/orders/admin-orders', () => ({
  ...jest.requireActual('@/services/orders/admin-orders'),
  listAdminOrders: jest.fn(),
  acknowledgeOrder: jest.fn(),
  markCodCollected: jest.fn(),
}));

const getCurrentUser = jest.fn();
const ctx = { params: Promise.resolve({ ref: 'BCM-1' }) };
const post = () => new NextRequest('http://localhost/api/admin/orders/BCM-1/x', { method: 'POST' });

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAuthProvider).mockReturnValue({ getCurrentUser } as never);
});

describe('admin orders routes', () => {
  it.each([
    ['unauthenticated', null, 401],
    ['customer', { id: 'u', role: 'customer', homeSiteId: null }, 403],
  ])('rejects %s callers before touching the service', async (_name, user, status) => {
    getCurrentUser.mockResolvedValue(user);

    expect((await list(new NextRequest('http://localhost/api/admin/orders'))).status).toBe(status);
    expect((await acknowledge(post(), ctx)).status).toBe(status);
    expect((await collectCod(post(), ctx)).status).toBe(status);
    expect(listAdminOrders).not.toHaveBeenCalled();
    expect(acknowledgeOrder).not.toHaveBeenCalled();
    expect(markCodCollected).not.toHaveBeenCalled();
  });

  it('lists with parsed filter and page for staff', async () => {
    const staff = { id: 's', role: 'staff', homeSiteId: 'site-1' };
    getCurrentUser.mockResolvedValue(staff);
    jest.mocked(listAdminOrders).mockResolvedValue({ orders: [] } as never);

    await list(new NextRequest('http://localhost/api/admin/orders?filter=cod&page=3&q=ngoc'));

    expect(listAdminOrders).toHaveBeenCalledWith(staff, { filter: 'cod', page: 3, query: 'ngoc' });
  });

  it('maps service errors to 404 and 409', async () => {
    getCurrentUser.mockResolvedValue({ id: 's', role: 'staff', homeSiteId: 'site-1' });
    jest.mocked(acknowledgeOrder).mockRejectedValue(new AdminOrderNotFoundError());
    jest.mocked(markCodCollected).mockRejectedValue(new AdminOrderConflictError('x'));

    expect((await acknowledge(post(), ctx)).status).toBe(404);
    expect((await collectCod(post(), ctx)).status).toBe(409);
  });
});
