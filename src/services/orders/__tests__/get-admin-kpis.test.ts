jest.mock('@/lib/prisma', () => ({
  prisma: { order: { aggregate: jest.fn(), count: jest.fn() }, enrollment: { count: jest.fn() } },
}));

import { prisma } from '@/lib/prisma';

import { getAdminKpis } from '../get-admin-kpis';

const mockAggregate = prisma.order.aggregate as jest.Mock;
const mockOrderCount = prisma.order.count as jest.Mock;
const mockEnrollmentCount = prisma.enrollment.count as jest.Mock;

const totals = (count: number, sum: number | null) => ({
  _count: { _all: count },
  _sum: { totalVnd: sum },
});

// 2026-08-13 12:00 in Ho Chi Minh
const NOW = new Date('2026-08-13T05:00:00Z');

describe('getAdminKpis', () => {
  afterEach(() => jest.resetAllMocks());

  it('counts only paid-or-later orders inside the local day (UTC+7 midnight boundary)', async () => {
    mockAggregate.mockResolvedValue(totals(0, null));
    mockOrderCount.mockResolvedValue(0);
    mockEnrollmentCount.mockResolvedValue(0);

    await getAdminKpis(NOW);

    const [todayCall, yesterdayCall] = mockAggregate.mock.calls.map(([arg]) => arg);
    expect(todayCall.where.status.in).toEqual([
      'paid',
      'awaiting_cod',
      'shipped',
      'delivered',
      'completed',
    ]);
    expect(todayCall.where.createdAt).toEqual({
      gte: new Date('2026-08-12T17:00:00Z'),
      lt: new Date('2026-08-13T17:00:00Z'),
    });
    expect(yesterdayCall.where.createdAt).toEqual({
      gte: new Date('2026-08-11T17:00:00Z'),
      lt: new Date('2026-08-12T17:00:00Z'),
    });
  });

  it('counts awaiting despatch as paid/COD home deliveries without a shipment', async () => {
    mockAggregate.mockResolvedValue(totals(0, null));
    mockOrderCount.mockResolvedValue(9);
    mockEnrollmentCount.mockResolvedValue(0);

    const kpis = await getAdminKpis(NOW);

    expect(mockOrderCount).toHaveBeenCalledWith({
      where: {
        status: { in: ['paid', 'awaiting_cod'] },
        deliveryMode: 'home_delivery',
        shipment: null,
      },
    });
    expect(kpis.awaitingDespatch).toBe(9);
  });

  it('computes revenue, order and sign-up figures with deltas', async () => {
    mockAggregate
      .mockResolvedValueOnce(totals(14, 4_400_000))
      .mockResolvedValueOnce(totals(11, 4_000_000));
    mockOrderCount.mockResolvedValue(0);
    mockEnrollmentCount.mockResolvedValueOnce(6).mockResolvedValueOnce(8);

    const kpis = await getAdminKpis(NOW);

    expect(kpis).toMatchObject({
      ordersToday: 14,
      ordersDelta: 3,
      revenueTodayVnd: 4_400_000,
      revenueDeltaPercent: 10,
      signUpsLast7Days: 6,
      signUpsDelta: -2,
    });
    expect(mockEnrollmentCount.mock.calls[0][0].where.status.in).toEqual(['active', 'completed']);
  });

  it('omits deltas when the baseline is zero', async () => {
    mockAggregate.mockResolvedValueOnce(totals(3, 900_000)).mockResolvedValueOnce(totals(0, null));
    mockOrderCount.mockResolvedValue(0);
    mockEnrollmentCount.mockResolvedValueOnce(2).mockResolvedValueOnce(0);

    const kpis = await getAdminKpis(NOW);

    expect(kpis.ordersDelta).toBeNull();
    expect(kpis.revenueDeltaPercent).toBeNull();
    expect(kpis.signUpsDelta).toBeNull();
  });
});
