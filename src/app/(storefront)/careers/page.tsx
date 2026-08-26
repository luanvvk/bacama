import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';

const CareersPage = async () => {
  const t = await getTranslations('CareersPage');

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('role1Eyebrow')}
              </p>
              <CardTitle>{t('role1Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="muted">{t('role1Description')}</Text>
              <Button asChild variant="outline" className="mt-5">
                <Link href="mailto:hang@bacama.vn?subject=Barista%20application">
                  {t('askAboutRole')}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('role2Eyebrow')}
              </p>
              <CardTitle>{t('role2Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="muted">{t('role2Description')}</Text>
              <Button asChild variant="outline" className="mt-5">
                <Link href="mailto:hang@bacama.vn?subject=Workshop%20application">
                  {t('askAboutRole')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="mt-14 max-w-2xl">
          <Heading as="h2" size="md">
            {t('noMatchHeading')}
          </Heading>
          <Text className="text-muted-foreground mt-4">{t('noMatchBody')}</Text>
          <Button asChild className="mt-7">
            <Link href="mailto:hang@bacama.vn?subject=Working%20at%20Bacama">
              {t('introduceYourself')}
            </Link>
          </Button>
        </div>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default CareersPage;
