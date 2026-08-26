import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const PressPage = async () => {
  const t = await getTranslations('PressPage');

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <Heading as="h2" size="md">
              {t('briefHeading')}
            </Heading>
            <Text className="text-muted-foreground mt-4">{t('briefBody1')}</Text>
            <Text className="text-muted-foreground mt-4">{t('briefBody2')}</Text>
            <Button asChild className="mt-7">
              <Link href="mailto:hang@bacama.vn?subject=Press%20enquiry">
                {t('contactForPress')}
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t('quickFactsHeading')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">{t('foundedLabel')}</span>
                <span className="font-mono">2017</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">{t('basedInLabel')}</span>
                <span>Đà Nẵng</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">{t('focusLabel')}</span>
                <span>{t('focusValue')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('pressEmailLabel')}</span>
                <span>hang@bacama.vn</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default PressPage;
