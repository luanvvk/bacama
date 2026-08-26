import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const STEPS = ['01', '02', '03'];

const ShippingReturnsPage = async () => {
  const t = await getTranslations('ShippingReturnsPage');

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((number, index) => (
            <Card key={number}>
              <CardHeader>
                <p className="text-primary font-mono text-xs">{number}</p>
                <CardTitle>{t(`step${index + 1}Title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Text variant="muted">{t(`step${index + 1}Body`)}</Text>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <Heading as="h2" size="md">
              {t('coffeeReturnsHeading')}
            </Heading>
            <Text className="text-muted-foreground mt-4">{t('coffeeReturnsBody')}</Text>
          </div>
          <div>
            <Heading as="h2" size="md">
              {t('coursesBookingsHeading')}
            </Heading>
            <Text className="text-muted-foreground mt-4">{t('coursesBookingsBody')}</Text>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-10">
          <Link href="/contact">{t('askAboutOrder')}</Link>
        </Button>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default ShippingReturnsPage;
