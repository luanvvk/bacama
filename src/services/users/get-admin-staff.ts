import type { $Enums } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: Extract<$Enums.Role, 'staff' | 'instructor' | 'admin'>;
  homeSiteName: string | null;
}

export const getAdminStaff = async (): Promise<AdminStaffMember[]> => {
  const users = await prisma.user.findMany({
    where: { role: { in: ['staff', 'instructor', 'admin'] } },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      homeSite: { select: { nameEn: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AdminStaffMember['role'],
    homeSiteName: user.homeSite?.nameEn ?? null,
  }));
};
