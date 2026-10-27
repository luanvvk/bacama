import { canAccessSite } from '@/lib/auth/scoped';
import type { AuthUser } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';

import { MenuItemNotFoundError, SiteForbiddenError } from './menu-item-errors';
import type { UpdateMenuItemInput } from './menu-item-schema';

const loadAccessibleItem = async (user: AuthUser, id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id }, select: { siteId: true } });

  if (!item) throw new MenuItemNotFoundError();
  if (!canAccessSite(user, item.siteId)) throw new SiteForbiddenError();
};

export const updateMenuItem = async (user: AuthUser, id: string, input: UpdateMenuItemInput) => {
  await loadAccessibleItem(user, id);

  return prisma.menuItem.update({ where: { id }, data: input });
};

export const deactivateMenuItem = async (user: AuthUser, id: string) => {
  await loadAccessibleItem(user, id);

  return prisma.menuItem.update({ where: { id }, data: { isActive: false } });
};
