jest.mock('@/lib/prisma', () => ({
  prisma: { shipment: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';
import type { AuthUser } from '@/lib/providers/auth/types';

import { getAdminShipment, listAdminShipments } from '../admin-shipments';

const shipment = prisma.shipment as unknown as Record<
  'findMany' | 'findFirst' | 'count',
  jest.Mock
>;

const admin = { id: 'a', role: 'admin', homeSiteId: null } as AuthUser;
const staff = { id: 's', role: 'staff', homeSiteId: 'site-1' } as AuthUser;

beforeEach(() => {
  Object.values(shipment).forEach((fn) => fn.mockReset());
  shipment.findMany.mockResolvedValue([]);
  shipment.count.mockResolvedValue(0);
});

describe('listAdminShipments', () => {
  it('returns the summary counts alongside the rows', async () => {
    shipment.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);

    const result = await listAdminShipments(admin);

    expect(result.summary).toEqual({
      awaitingPickup: 1,
      inTransit: 7,
      deliveredToday: 2,
      codPending: 3,
    });
  });

  it('scopes staff to their site through the order', async () => {
    await listAdminShipments(staff);

    const where = JSON.stringify(shipment.findMany.mock.calls[0][0].where);
    expect(where).toContain('site-1');
  });

  it('does not scope admins by site', async () => {
    await listAdminShipments(admin);

    const where = JSON.stringify(shipment.findMany.mock.calls[0][0].where);
    expect(where).not.toContain('pickupSiteId');
  });

  it('filters in-transit shipments and searches by tracking, ref or name', async () => {
    await listAdminShipments(admin, { filter: 'transit', query: ' ghn ' });

    const where = JSON.stringify(shipment.findMany.mock.calls[0][0].where);
    expect(where).toContain('in_transit');
    expect(where).toContain('"contains":"ghn"');
  });
});

describe('getAdminShipment', () => {
  it('looks up by tracking number or id within the user scope', async () => {
    shipment.findFirst.mockResolvedValue(null);

    await expect(getAdminShipment(staff, 'GHN-1')).resolves.toBeNull();

    const where = JSON.stringify(shipment.findFirst.mock.calls[0][0].where);
    expect(where).toContain('GHN-1');
    expect(where).toContain('site-1');
  });
});
