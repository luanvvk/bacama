import { getTranslations } from 'next-intl/server';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getBakeryItems } from '@/services/catalog/get-bakery-items';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { BakeryCard } from '@/components/bakery/BakeryCard';

export const revalidate = 3600;

const BakeryPage = async () => {
  const [t, tAnnouncements, items] = await Promise.all([
    getTranslations('Bakery'),
    getTranslations('Announcements'),
    getBakeryItems(),
  ]);

  return (
    <>
      <AnnouncementBar items={tAnnouncements.raw('bakery')} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumbCurrent')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="py-8">
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {t('itemsCount', { count: items.length })}
            </p>

            {items.length === 0 ? (
              <p className="text-muted-foreground py-16 text-center text-sm">{t('emptyState')}</p>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <BakeryCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default BakeryPage;
