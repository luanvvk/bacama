jest.mock('@/lib/prisma', () => ({
  prisma: { user: { findMany: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getAdminStaff } from '../get-admin-staff';

const findMany = prisma.user.findMany as jest.Mock;

describe('getAdminStaff', () => {
  beforeEach(() => findMany.mockReset());

  it('queries only staff, instructor and admin users and selects only displayed fields', async () => {
    findMany.mockResolvedValue([]);

    await getAdminStaff();

    const args = findMany.mock.calls[0][0];
    expect(args.where).toEqual({ role: { in: ['staff', 'instructor', 'admin'] } });
    expect(args.select).toEqual({
      id: true,
      name: true,
      email: true,
      role: true,
      homeSite: { select: { nameEn: true } },
    });
  });

  it('maps rows to a DTO with the home site name, or null when unassigned', async () => {
    findMany.mockResolvedValue([
      { id: 'u1', name: 'Hang', email: 'h@x.vn', role: 'admin', homeSite: null },
      { id: 'u2', name: 'Mai', email: 'm@x.vn', role: 'staff', homeSite: { nameEn: 'Da Nang' } },
    ]);

    const staff = await getAdminStaff();

    expect(Object.keys(staff[0]).sort()).toEqual(['email', 'homeSiteName', 'id', 'name', 'role']);
    expect(staff.map((s) => s.homeSiteName)).toEqual([null, 'Da Nang']);
  });
});
