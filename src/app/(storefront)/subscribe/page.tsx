import { getTranslations } from 'next-intl/server';

import { NewsletterForm } from '@/app/(storefront)/_components/NewsletterForm';
import { StaticPageShell } from '@/app/(storefront)/_components/StaticPageShell';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const PERKS = ['01', '02', '03'];

const SubscribePage = async () => {
  const t = await getTranslations('SubscribePage');

  return (
    <>
      <StaticPageShell eyebrow={t('eyebrow')} title={t('title')} description={t('description')}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('whatArrives')}
            </p>
            <h2 className="font-heading mt-3 text-3xl">{t('noteHeading')}</h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">{t('noteBody')}</p>
            <div className="mt-10 grid gap-5 border-t pt-6 sm:grid-cols-3 lg:grid-cols-1">
              {PERKS.map((number, index) => (
                <div key={number} className="grid grid-cols-[32px_1fr] gap-3">
                  <p className="text-primary font-mono text-xs">{number}</p>
                  <div>
                    <p className="text-sm font-semibold">{t(`perk${index + 1}Title`)}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t(`perk${index + 1}Description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t('joinLetterHeading')}</CardTitle>
            </CardHeader>
            <CardContent>
              <NewsletterForm />
              <p className="text-muted-foreground mt-4 text-xs">{t('agreeText')}</p>
            </CardContent>
          </Card>
        </div>
      </StaticPageShell>
      <Footer />
    </>
  );
};

export default SubscribePage;
