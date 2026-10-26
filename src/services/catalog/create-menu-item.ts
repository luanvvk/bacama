import { canAccessSite } from '@/lib/auth/scoped';
import type { AuthUser } from '@/lib/providers/auth/types';
import { prisma } from '@/lib/prisma';

import { SiteForbiddenError } from './menu-item-errors';
import type { CreateMenuItemInput } from './menu-item-schema';
import { uniqueMenuItemSlug } from './slugify';

export const createMenuItem = async (user: AuthUser, input: CreateMenuItemInput) => {
  if (!canAccessSite(user, input.siteId)) throw new SiteForbiddenError();

  const slug = await uniqueMenuItemSlug(input.siteId, input.nameEn);

  return prisma.menuItem.create({ data: { ...input, slug } });
};
