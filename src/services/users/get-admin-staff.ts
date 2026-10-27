import type { $Enums } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { pageArgs, toPage, type Page, type PageParams } from '@/services/paging';

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: Extract<$Enums.Role, 'staff' | 'instructor' | 'admin'>;
  homeSiteName: string | null;
}

export const getAdminStaff = async (params: PageParams = {}): Promise<Page<AdminStaffMember>> => {
  const rows = await prisma.user.findMany({
    where: { role: { in: ['staff', 'instructor', 'admin'] } },
    orderBy: [{ role: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    ...pageArgs(params),
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      homeSite: { select: { nameEn: true } },
    },
  });

  const { items, nextCursor } = toPage(rows, params);

  return {
    nextCursor,
    items: items.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AdminStaffMember['role'],
      homeSiteName: user.homeSite?.nameEn ?? null,
    })),
  };
};
