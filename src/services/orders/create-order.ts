import { randomBytes } from 'node:crypto';

import { prisma } from '@/lib/prisma';
import { BUSINESS_CONTACT } from '@/constants/business';
import { getPaymentProviderByMethod, PaymentMethodUnavailableError } from '@/lib/providers/payment';
import type { PaymentMethodValue } from '@/constants/checkout';
import type { PaymentProvider } from '@/lib/providers/payment/types';
import type { $Enums, Prisma } from '@/generated/prisma/client';

const MAX_ORDER_SUBTOTAL_VND = 1_000_000_000;

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

const generateOrderRef = () => `BCM-${randomBytes(8).toString('hex').toUpperCase()}`;

/**
 * Validates the cart against live prices/stock, enforces the §4.2 invariants
 * (exactly one item reference per line, pickup ⟹ pickupSiteId, home delivery
 * ⟹ address+province), and persists Order + OrderItem. Online-payment orders
 * then open a payment session and store its `providerRef`, which the payment
 * webhook uses to find the order. Stock is only decremented once payment is
 * confirmed.
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
  const productQuantities = new Map<string, number>();
  let subtotalVnd = 0;

  for (const item of input.items) {
    const kind = item.kind ?? 'product';

    if (kind === 'product') {
      const product = productById.get(item.id);
      if (!product) throw new OrderValidationError(`Product "${item.id}" is no longer available.`);
      const requested = (productQuantities.get(product.id) ?? 0) + item.quantity;
      if (product.stock < requested) {
        throw new OrderValidationError(`Only ${product.stock} left of "${product.nameEn}".`);
      }
      subtotalVnd += product.priceVnd * item.quantity;
      productQuantities.set(product.id, requested);
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

  if (subtotalVnd > MAX_ORDER_SUBTOTAL_VND) {
    throw new OrderValidationError('Order total is too large.');
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

  let paymentProvider: PaymentProvider | null = null;
  if (input.paymentMethod !== 'cod') {
    try {
      paymentProvider = getPaymentProviderByMethod(input.paymentMethod);
    } catch (error) {
      if (error instanceof PaymentMethodUnavailableError) {
        throw new OrderValidationError('This payment method is not available right now.');
      }
      throw error;
    }
  }

  const status: $Enums.OrderStatus = input.paymentMethod === 'cod' ? 'awaiting_cod' : 'pending';
  const orderData: Prisma.OrderUncheckedCreateInput = {
    ref: generateOrderRef(),
    userId: input.userId ?? null,
    status,
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
    paymentProvider: input.paymentMethod,
    items: { create: orderItems },
  };

  // Online methods stay a soft reservation: stock is only decremented once
  // payment is confirmed (task 2.8).
  if (paymentProvider) {
    const order = await prisma.order.create({ data: orderData, select: { id: true, ref: true } });
    const session = await paymentProvider.pay(orderData.totalVnd, order.ref, {
      locale: input.locale,
      addressCountry: 'VN',
      preferredMethod: input.paymentMethod,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { providerRef: session.providerRef },
    });
    return order;
  }

  // COD has no online payment gate — the order is accepted at creation, so
  // stock is committed now rather than waiting for a "paid" webhook that
  // will never come.
  return prisma.$transaction(async (tx) => {
    for (const [productId, quantity] of productQuantities) {
      const { count } = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) {
        throw new OrderValidationError('One of the items in your order just sold out.');
      }
    }

    return tx.order.create({ data: orderData, select: { id: true, ref: true } });
  });
};
