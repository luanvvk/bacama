import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const GIFT_OPTIONS = ['500,000 ₫', '1,000,000 ₫', '2,000,000 ₫'];

const GiftCardsPage = async () => {
  const t = await getTranslations('GiftCardsPage');

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <div className="grid gap-5 md:grid-cols-3">
          {GIFT_OPTIONS.map((amount, index) => (
            <Card key={amount}>
              <CardHeader>
                <p className="font-heading text-3xl">{amount}</p>
                <CardTitle className="mt-2 text-sm">{t(`optionDetail${index + 1}`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href="/contact">{t('askAboutGift')}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-14 max-w-2xl">
          <Heading as="h2" size="md">
            {t('notSureHeading')}
          </Heading>
          <Text className="text-muted-foreground mt-4">{t('notSureBody')}</Text>
          <Button asChild className="mt-7">
            <Link href="mailto:hang@bacama.vn?subject=Bacama%20gift">{t('emailRoastery')}</Link>
          </Button>
        </div>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default GiftCardsPage;
