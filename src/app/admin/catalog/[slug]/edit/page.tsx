import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ProductEditor } from '@/components/admin/ProductEditor';
import { Badge } from '@/components/ui/Badge';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminProductBySlug } from '@/services/catalog/get-admin-products';

interface AdminProductEditPageProps {
  params: Promise<{ slug: string }>;
}

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
  await requireRoles(['staff', 'admin']);
  const { slug } = await params;
  const [product, t] = await Promise.all([
    getAdminProductBySlug(slug),
    getTranslations('Admin.editor'),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            {t('breadcrumb')} / {product.name}
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <Badge variant={product.isActive ? 'success' : 'destructive'}>
          {product.isActive ? t('statusLive') : t('statusPaused')}
        </Badge>
      </div>
      <ProductEditor product={product} />
    </div>
  );
};

export default AdminProductEditPage;
