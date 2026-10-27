import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { requireRoles } from '@/lib/auth/guards';
import { getAdminSites } from '@/services/sites/site-admin';

const AdminSitesPage = async () => {
  await requireRoles(['admin']);
  const [sites, t] = await Promise.all([getAdminSites(), getTranslations('Admin.sites')]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>

      {sites.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('empty')}</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{site.nameEn}</CardTitle>
                <Badge variant={site.isActive ? 'success' : 'outline'}>
                  {site.isActive ? t('statusActive') : t('statusInactive')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{site.addressEn}</p>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">{t('hours')}</span>
                  <span className="font-mono text-xs">{site.hoursEn}</span>
                </div>
                <Link
                  href={`/admin/sites/${site.slug}/edit`}
                  className="text-primary inline-block underline-offset-4 hover:underline"
                >
                  {t('edit')}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSitesPage;
