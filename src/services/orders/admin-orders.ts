import { getVietnamDayRange } from '@/lib/vietnam-day';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import type { AuthUser } from '@/lib/providers/auth/types';

export const ADMIN_ORDERS_PAGE_SIZE = 20;

export type AdminOrderFilter = 'all' | 'ack' | 'cod' | 'failed';

export class AdminOrderNotFoundError extends Error {
  constructor() {
    super('Order not found');
    this.name = 'AdminOrderNotFoundError';
  }
}

export class AdminOrderConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminOrderConflictError';
  }
}

/**
 * Orders carry no siteId of their own: a site's staff see orders picked up at
 * their site or containing that site's bakery/menu items, plus online-only
 * orders (coffee, courses) that are not tied to any site. Admins see all.
 */
export const siteWhere = (user: AuthUser): Prisma.OrderWhereInput => {
  if (user.role === 'admin') return {};
  if (!user.homeSiteId) return { id: { in: [] } };

  const siteItem = {
    OR: [{ bakeryItem: { siteId: user.homeSiteId } }, { menuItem: { siteId: user.homeSiteId } }],
  };

  return {
    OR: [
      { pickupSiteId: user.homeSiteId },
      { items: { some: siteItem } },
      {
        pickupSiteId: null,
        items: { none: { OR: [{ bakeryItemId: { not: null } }, { menuItemId: { not: null } }] } },
      },
    ],
  };
};

const filterWhere = (filter: AdminOrderFilter): Prisma.OrderWhereInput => {
  if (filter === 'ack') {
    return { acknowledgedAt: null, status: { in: ['paid', 'awaiting_cod'] } };
  }
  if (filter === 'cod') return { paymentProvider: 'cod' };
  if (filter === 'failed') return { status: 'failed' };
  return {};
};

const listSelect = {
  id: true,
  ref: true,
  createdAt: true,
  customerName: true,
  paymentProvider: true,
  totalVnd: true,
  status: true,
  acknowledgedAt: true,
  items: { select: { nameSnapshot: true, quantity: true } },
} satisfies Prisma.OrderSelect;

export type AdminOrderListItem = Prisma.OrderGetPayload<{ select: typeof listSelect }>;

export interface AdminOrderList {
  orders: AdminOrderListItem[];
  total: number;
  page: number;
  pageCount: number;
  /** Oldest paid/COD order nobody on staff has acknowledged yet. */
  oldestUnacknowledged: AdminOrderListItem | null;
}

export const listAdminOrders = async (
  user: AuthUser,
  options: { page?: number; filter?: AdminOrderFilter; query?: string } = {},
): Promise<AdminOrderList> => {
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const query = options.query?.trim();
  const where: Prisma.OrderWhereInput = {
    AND: [
      siteWhere(user),
      filterWhere(options.filter ?? 'all'),
      query
        ? {
            OR: [
              { ref: { contains: query, mode: 'insensitive' } },
              { customerName: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
            ],
          }
        : {},
    ],
  };

  const [orders, total, oldestUnacknowledged] = await Promise.all([
    prisma.order.findMany({
      where,
      select: listSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
      take: ADMIN_ORDERS_PAGE_SIZE,
    }),
    prisma.order.count({ where }),
    prisma.order.findFirst({
      where: { AND: [siteWhere(user), filterWhere('ack')] },
      select: listSelect,
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return {
    orders,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE)),
    oldestUnacknowledged,
  };
};

const detailInclude = {
  items: true,
  pickupSite: { select: { nameEn: true } },
  shipment: { select: { courierProvider: true, trackingNo: true, status: true } },
} satisfies Prisma.OrderInclude;

export type AdminOrderDetail = Prisma.OrderGetPayload<{ include: typeof detailInclude }>;

export const getAdminOrder = async (
  user: AuthUser,
  ref: string,
): Promise<AdminOrderDetail | null> =>
  prisma.order.findFirst({ where: { AND: [{ ref }, siteWhere(user)] }, include: detailInclude });

const findScoped = async (user: AuthUser, ref: string) => {
  const order = await prisma.order.findFirst({
    where: { AND: [{ ref }, siteWhere(user)] },
    select: { id: true, status: true, paymentProvider: true, acknowledgedAt: true },
  });
  if (!order) throw new AdminOrderNotFoundError();
  return order;
};

/** Idempotent: acknowledging an already-acknowledged order keeps the first timestamp. */
export const acknowledgeOrder = async (user: AuthUser, ref: string): Promise<void> => {
  const order = await findScoped(user, ref);
  if (order.status !== 'paid' && order.status !== 'awaiting_cod') {
    throw new AdminOrderConflictError('Only paid or COD orders can be acknowledged');
  }

  await prisma.order.updateMany({
    where: { id: order.id, acknowledgedAt: null },
    data: { acknowledgedAt: new Date() },
  });
};

/** awaiting_cod -> completed. The status guard makes a double click a conflict, not a second write. */
export const markCodCollected = async (user: AuthUser, ref: string): Promise<void> => {
  const order = await findScoped(user, ref);
  if (order.paymentProvider !== 'cod') {
    throw new AdminOrderConflictError('Not a COD order');
  }

  const now = new Date();
  const { count } = await prisma.order.updateMany({
    where: { id: order.id, status: 'awaiting_cod' },
    data: { status: 'completed', paidAt: now, acknowledgedAt: order.acknowledgedAt ?? now },
  });
  if (count === 0) throw new AdminOrderConflictError('Order is not awaiting COD');
};

const todaySelect = {
  ref: true,
  customerName: true,
  paymentProvider: true,
  totalVnd: true,
  status: true,
  acknowledgedAt: true,
  items: { select: { nameSnapshot: true, quantity: true } },
} satisfies Prisma.OrderSelect;

export type AdminTodayOrder = Prisma.OrderGetPayload<{ select: typeof todaySelect }>;

/** Orders created today (Asia/Ho_Chi_Minh), newest first, scoped to the user's site. */
export const listTodaysOrders = async (
  user: AuthUser,
  now = new Date(),
): Promise<AdminTodayOrder[]> => {
  const { start, end } = getVietnamDayRange(now);

  return prisma.order.findMany({
    where: { AND: [siteWhere(user), { createdAt: { gte: start, lt: end } }] },
    select: todaySelect,
    orderBy: { createdAt: 'desc' },
  });
};
