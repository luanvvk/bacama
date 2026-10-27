import { getLocale, getTranslations } from 'next-intl/server';

import { toAppLocale } from '@/lib/localize';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getProducts } from '@/services/catalog/get-products';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

import { ShopBrowser } from './_components/ShopBrowser';

const ShopPage = async () => {
  const locale = toAppLocale(await getLocale());
  const [t, tAnnouncements, products] = await Promise.all([
    getTranslations('Shop'),
    getTranslations('Announcements'),
    getProducts(locale),
  ]);

  return (
    <>
      <AnnouncementBar items={tAnnouncements.raw('shop')} />
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

          <h1 className="sr-only">{t('breadcrumbCurrent')}</h1>
          <ShopBrowser products={products} />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default ShopPage;
