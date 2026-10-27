import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { AuthUser } from '@/lib/providers/auth/types';
import { getVietnamDayRange } from '@/lib/vietnam-day';

import { siteWhere } from './admin-orders';

export const ADMIN_SHIPMENTS_LIMIT = 100;

export type AdminShipmentFilter = 'all' | 'transit' | 'delivered' | 'cod';

const scoped = (user: AuthUser): Prisma.ShipmentWhereInput => ({ order: siteWhere(user) });

const filterWhere = (filter: AdminShipmentFilter): Prisma.ShipmentWhereInput => {
  if (filter === 'transit') return { status: { in: ['created', 'picked_up', 'in_transit'] } };
  if (filter === 'delivered') return { status: 'delivered' };
  if (filter === 'cod') return { order: { status: 'awaiting_cod' } };
  return {};
};

const listSelect = {
  id: true,
  trackingNo: true,
  courierProvider: true,
  status: true,
  updatedAt: true,
  order: { select: { ref: true, customerName: true } },
} satisfies Prisma.ShipmentSelect;

export type AdminShipmentListItem = Prisma.ShipmentGetPayload<{ select: typeof listSelect }>;

export interface AdminShipmentSummary {
  awaitingPickup: number;
  inTransit: number;
  deliveredToday: number;
  codPending: number;
}

export interface AdminShipmentList {
  shipments: AdminShipmentListItem[];
  summary: AdminShipmentSummary;
}

export const listAdminShipments = async (
  user: AuthUser,
  options: { filter?: AdminShipmentFilter; query?: string; now?: Date } = {},
): Promise<AdminShipmentList> => {
  const query = options.query?.trim();
  const base = scoped(user);
  const { start, end } = getVietnamDayRange(options.now ?? new Date());

  const [shipments, awaitingPickup, inTransit, deliveredToday, codPending] = await Promise.all([
    prisma.shipment.findMany({
      where: {
        AND: [
          base,
          filterWhere(options.filter ?? 'all'),
          query
            ? {
                OR: [
                  { trackingNo: { contains: query, mode: 'insensitive' } },
                  { order: { ref: { contains: query, mode: 'insensitive' } } },
                  { order: { customerName: { contains: query, mode: 'insensitive' } } },
                ],
              }
            : {},
        ],
      },
      select: listSelect,
      orderBy: { updatedAt: 'desc' },
      take: ADMIN_SHIPMENTS_LIMIT,
    }),
    prisma.shipment.count({ where: { AND: [base, { status: 'created' }] } }),
    prisma.shipment.count({
      where: { AND: [base, { status: { in: ['picked_up', 'in_transit'] } }] },
    }),
    prisma.shipment.count({
      where: { AND: [base, { status: 'delivered', deliveredAt: { gte: start, lt: end } }] },
    }),
    prisma.shipment.count({ where: { AND: [base, filterWhere('cod')] } }),
  ]);

  return { shipments, summary: { awaitingPickup, inTransit, deliveredToday, codPending } };
};

const detailSelect = {
  id: true,
  trackingNo: true,
  courierProvider: true,
  status: true,
  createdAt: true,
  shippedAt: true,
  deliveredAt: true,
  order: {
    select: {
      ref: true,
      customerName: true,
      phone: true,
      addressLine: true,
      province: true,
    },
  },
} satisfies Prisma.ShipmentSelect;

export type AdminShipmentDetail = Prisma.ShipmentGetPayload<{ select: typeof detailSelect }>;

/** `key` is the tracking number, or the shipment id when no tracking number was issued. */
export const getAdminShipment = async (
  user: AuthUser,
  key: string,
): Promise<AdminShipmentDetail | null> =>
  prisma.shipment.findFirst({
    where: { AND: [scoped(user), { OR: [{ trackingNo: key }, { id: key }] }] },
    select: detailSelect,
  });
