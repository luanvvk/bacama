import { prisma } from '@/lib/prisma';

export const getSiteName = async (siteId: string, locale: 'vi' | 'en'): Promise<string | null> => {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { nameVi: true, nameEn: true },
  });

  if (!site) return null;
  return locale === 'vi' ? site.nameVi : site.nameEn;
};
