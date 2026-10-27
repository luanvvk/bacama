'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from '@/lib/toast';
import type { AdminSite } from '@/services/sites/site-admin';

export interface SitesGridProps {
  sites: AdminSite[];
  nextCursor: string | null;
}

export const SitesGrid = ({ sites: initialSites, nextCursor: initialCursor }: SitesGridProps) => {
  const t = useTranslations('Admin.sites');
  const [sites, setSites] = useState(initialSites);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sites?cursor=${encodeURIComponent(nextCursor)}`);
      if (!response.ok) throw new Error(String(response.status));
      const page: { items: AdminSite[]; nextCursor: string | null } = await response.json();
      setSites((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      toast.error(t('loadMoreFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (sites.length === 0) return <p className="text-muted-foreground text-sm">{t('empty')}</p>;

  return (
    <>
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
      {nextCursor && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 min-w-32"
            onClick={loadMore}
            disabled={loading}
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </>
  );
};
