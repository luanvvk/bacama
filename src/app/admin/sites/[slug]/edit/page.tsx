import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SiteEditor } from '@/components/admin/SiteEditor';
import { requireRoles } from '@/lib/auth/guards';
import { getActiveProductOptions, getAdminSiteBySlug } from '@/services/sites/site-admin';

interface AdminSiteEditPageProps {
  params: Promise<{ slug: string }>;
}

const AdminSiteEditPage = async ({ params }: AdminSiteEditPageProps) => {
  await requireRoles(['admin']);
  const { slug } = await params;
  const [site, products, t] = await Promise.all([
    getAdminSiteBySlug(slug),
    getActiveProductOptions(),
    getTranslations('Admin.sites'),
  ]);

  if (!site) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {t('editTitle', { name: site.nameEn })}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('editDescription')}</p>
      </div>
      <SiteEditor site={site} products={products} />
    </div>
  );
};

export default AdminSiteEditPage;
