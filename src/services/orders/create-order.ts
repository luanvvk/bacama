import { randomBytes } from 'node:crypto';

import { prisma } from '@/lib/prisma';
import { BUSINESS_CONTACT } from '@/constants/business';
import type { PaymentMethodValue } from '@/constants/checkout';
import type { $Enums, Prisma } from '@/generated/prisma/client';

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export interface CreateOrderItemInput {
  id: string;
  kind?: 'product' | 'bakery' | 'menu';
  quantity: number;
  weight?: string;
  grind?: string;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  customerName: string;
  phone: string;
  email: string;
  note?: string;
  paymentMethod: PaymentMethodValue;
  deliveryOption: string;
  address?: string;
  province?: string;
  userId?: string | null;
  locale: 'vi' | 'en';
}

const PAYMENT_METHOD_MAP: Record<PaymentMethodValue, $Enums.PaymentMethod> = {
  zalopay: 'zalopay',
  momo: 'momo',
  vnpay: 'vnpay_qr',
  bank: 'bank_transfer',
  card: 'card',
  cod: 'cod',
};

const generateOrderRef = () => `BCM-${randomBytes(4).toString('hex').toUpperCase()}`;

/**
 * Validates the cart against live prices/stock, enforces the §4.2 invariants
 * (exactly one item reference per line, pickup ⟹ pickupSiteId, home delivery
 * ⟹ address+province), and persists Order + OrderItem. Does not decrement
 * stock or touch payment providers — that happens once payment is confirmed.
 */
export const createOrder = async (
  input: CreateOrderInput,
): Promise<{ id: string; ref: string }> => {
  if (input.items.length === 0) {
    throw new OrderValidationError('Cannot place an order with no items.');
  }

  const idsByKind = { product: [] as string[], bakery: [] as string[], menu: [] as string[] };
  for (const item of input.items) idsByKind[item.kind ?? 'product'].push(item.id);

  const [products, bakeryItems, menuItems] = await Promise.all([
    idsByKind.product.length
      ? prisma.product.findMany({ where: { id: { in: idsByKind.product }, isActive: true } })
      : [],
    idsByKind.bakery.length
      ? prisma.bakeryItem.findMany({ where: { id: { in: idsByKind.bakery }, isActive: true } })
      : [],
    idsByKind.menu.length
      ? prisma.menuItem.findMany({ where: { id: { in: idsByKind.menu }, isActive: true } })
      : [],
  ]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const bakeryItemById = new Map(bakeryItems.map((item) => [item.id, item]));
  const menuItemById = new Map(menuItems.map((item) => [item.id, item]));

  const orderItems: Prisma.OrderItemCreateManyOrderInput[] = [];
  const pickupSiteIds = new Set<string>();
  let subtotalVnd = 0;

  for (const item of input.items) {
    const kind = item.kind ?? 'product';

    if (kind === 'product') {
      const product = productById.get(item.id);
      if (!product) throw new OrderValidationError(`Product "${item.id}" is no longer available.`);
      if (product.stock < item.quantity) {
        throw new OrderValidationError(`Only ${product.stock} left of "${product.nameEn}".`);
      }
      subtotalVnd += product.priceVnd * item.quantity;
      orderItems.push({
        productId: product.id,
        nameSnapshot: input.locale === 'vi' ? product.nameVi : product.nameEn,
        quantity: item.quantity,
        unitPriceVnd: product.priceVnd,
        weight: item.weight,
        grind: item.grind,
      });
      continue;
    }

    if (kind === 'bakery') {
      const bakeryItem = bakeryItemById.get(item.id);
      if (!bakeryItem) throw new OrderValidationError(`Item "${item.id}" is no longer available.`);
      subtotalVnd += bakeryItem.priceVnd * item.quantity;
      pickupSiteIds.add(bakeryItem.siteId);
      orderItems.push({
        bakeryItemId: bakeryItem.id,
        nameSnapshot: input.locale === 'vi' ? bakeryItem.nameVi : bakeryItem.nameEn,
        quantity: item.quantity,
        unitPriceVnd: bakeryItem.priceVnd,
      });
      continue;
    }

    const menuItem = menuItemById.get(item.id);
    if (!menuItem) throw new OrderValidationError(`Item "${item.id}" is no longer available.`);
    subtotalVnd += menuItem.priceVnd * item.quantity;
    pickupSiteIds.add(menuItem.siteId);
    orderItems.push({
      menuItemId: menuItem.id,
      nameSnapshot: input.locale === 'vi' ? menuItem.nameVi : menuItem.nameEn,
      quantity: item.quantity,
      unitPriceVnd: menuItem.priceVnd,
    });
  }

  if (pickupSiteIds.size > 1) {
    throw new OrderValidationError('Pickup items in this order belong to different cafés.');
  }

  const deliveryMode: $Enums.DeliveryMode =
    pickupSiteIds.size > 0 || input.deliveryOption === 'pickup' ? 'pickup' : 'home_delivery';

  let pickupSiteId: string | null = null;
  if (deliveryMode === 'pickup') {
    pickupSiteId =
      pickupSiteIds.size === 1
        ? [...pickupSiteIds][0]
        : ((
            await prisma.site.findFirst({
              where: { slug: BUSINESS_CONTACT.siteSlug, isActive: true },
              select: { id: true },
            })
          )?.id ?? null);
    if (!pickupSiteId) {
      throw new OrderValidationError('No pickup café is available for this order.');
    }
  } else if (!input.address || !input.province) {
    throw new OrderValidationError(
      'A delivery address and province are required for home delivery.',
    );
  }

  const order = await prisma.order.create({
    data: {
      ref: generateOrderRef(),
      userId: input.userId ?? null,
      status: input.paymentMethod === 'cod' ? 'awaiting_cod' : 'pending',
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      deliveryMode,
      addressLine: deliveryMode === 'home_delivery' ? input.address : null,
      province: deliveryMode === 'home_delivery' ? input.province : null,
      pickupSiteId,
      note: input.note,
      subtotalVnd,
      shippingVnd: 0,
      totalVnd: subtotalVnd,
      locale: input.locale,
      paymentProvider: PAYMENT_METHOD_MAP[input.paymentMethod],
      items: { create: orderItems },
    },
    select: { id: true, ref: true },
  });

  return order;
};
