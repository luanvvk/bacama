jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import type { AuthUser } from '@/lib/providers/auth/types';

import {
  acknowledgeOrder,
  AdminOrderConflictError,
  AdminOrderNotFoundError,
  listAdminOrders,
  markCodCollected,
} from '../admin-orders';

const order = prisma.order as unknown as Record<
  'findMany' | 'findFirst' | 'count' | 'updateMany',
  jest.Mock
>;

const admin = { id: 'a', role: 'admin', homeSiteId: null } as AuthUser;
const staff = { id: 's', role: 'staff', homeSiteId: 'site-1' } as AuthUser;

beforeEach(() => {
  Object.values(order).forEach((fn) => fn.mockReset());
});

describe('listAdminOrders', () => {
  it('paginates newest first and reports the page count', async () => {
    order.findMany.mockResolvedValue([]);
    order.count.mockResolvedValue(41);
    order.findFirst.mockResolvedValue(null);

    const result = await listAdminOrders(admin, { page: 2 });

    expect(order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 20, orderBy: { createdAt: 'desc' } }),
    );
    expect(result).toMatchObject({ page: 2, pageCount: 3, total: 41 });
  });

  it('scopes staff to their site but leaves admins unscoped', async () => {
    order.findMany.mockResolvedValue([]);
    order.count.mockResolvedValue(0);
    order.findFirst.mockResolvedValue(null);

    await listAdminOrders(staff);
    await listAdminOrders(admin);

    const staffWhere = JSON.stringify(order.findMany.mock.calls[0][0].where);
    const adminWhere = JSON.stringify(order.findMany.mock.calls[1][0].where);
    expect(staffWhere).toContain('site-1');
    expect(adminWhere).not.toContain('site-1');
  });

  it('applies the COD filter', async () => {
    order.findMany.mockResolvedValue([]);
    order.count.mockResolvedValue(0);
    order.findFirst.mockResolvedValue(null);

    await listAdminOrders(admin, { filter: 'cod' });

    expect(JSON.stringify(order.findMany.mock.calls[0][0].where)).toContain(
      '"paymentProvider":"cod"',
    );
  });
});

describe('acknowledgeOrder', () => {
  it('stamps acknowledgedAt only when it is still empty', async () => {
    order.findFirst.mockResolvedValue({ id: 'o1', status: 'paid', acknowledgedAt: null });

    await acknowledgeOrder(admin, 'BCM-1');

    expect(order.updateMany).toHaveBeenCalledWith({
      where: { id: 'o1', acknowledgedAt: null },
      data: { acknowledgedAt: expect.any(Date) },
    });
  });

  it('is not found when the order is outside the staff site scope', async () => {
    order.findFirst.mockResolvedValue(null);

    await expect(acknowledgeOrder(staff, 'BCM-1')).rejects.toBeInstanceOf(AdminOrderNotFoundError);
    expect(order.updateMany).not.toHaveBeenCalled();
  });

  it('rejects orders that are not paid or COD', async () => {
    order.findFirst.mockResolvedValue({ id: 'o1', status: 'failed', acknowledgedAt: null });

    await expect(acknowledgeOrder(admin, 'BCM-1')).rejects.toBeInstanceOf(AdminOrderConflictError);
  });
});

describe('markCodCollected', () => {
  it('moves awaiting_cod to completed behind a status guard', async () => {
    order.findFirst.mockResolvedValue({
      id: 'o1',
      status: 'awaiting_cod',
      paymentProvider: 'cod',
      acknowledgedAt: null,
    });
    order.updateMany.mockResolvedValue({ count: 1 });

    await markCodCollected(admin, 'BCM-1');

    expect(order.updateMany).toHaveBeenCalledWith({
      where: { id: 'o1', status: 'awaiting_cod' },
      data: expect.objectContaining({ status: 'completed' }),
    });
  });

  it('conflicts when another request already collected it', async () => {
    order.findFirst.mockResolvedValue({
      id: 'o1',
      status: 'awaiting_cod',
      paymentProvider: 'cod',
      acknowledgedAt: null,
    });
    order.updateMany.mockResolvedValue({ count: 0 });

    await expect(markCodCollected(admin, 'BCM-1')).rejects.toBeInstanceOf(AdminOrderConflictError);
  });

  it('conflicts for a non-COD order', async () => {
    order.findFirst.mockResolvedValue({
      id: 'o1',
      status: 'paid',
      paymentProvider: 'momo',
      acknowledgedAt: null,
    });

    await expect(markCodCollected(admin, 'BCM-1')).rejects.toBeInstanceOf(AdminOrderConflictError);
    expect(order.updateMany).not.toHaveBeenCalled();
  });
});
