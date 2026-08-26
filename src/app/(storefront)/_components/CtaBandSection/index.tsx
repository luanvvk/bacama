import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { getFeaturedProducts } from '@/services/catalog/get-featured-products';

const PAYMENT_METHODS = ['ZaloPay', 'MoMo', 'VNPay QR', 'COD', 'Visa · MC', 'GHN'];

export const CtaBandSection = async () => {
  const t = await getTranslations('CtaBand');
  // Named the featured bag rather than a hardcoded slug — the previous link
  // pointed at Đà Lạt Washed, which the real-data seed retired.
  const [featured] = await getFeaturedProducts();

  return (
    <section className="dark bg-background border-t">
      <Container className="py-16 text-center">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">{t('eyebrow')}</p>
        <Heading as="h2" size="lg" className="mx-auto mt-3 max-w-xl">
          {t('heading')}
        </Heading>
        <Text variant="lead" className="text-muted-foreground mx-auto mt-4 max-w-md">
          {t('lead')}
        </Text>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {featured && (
            <Button asChild size="lg">
              <Link href={`/product/${featured.slug}`}>
                {t('shopFeatured', { name: featured.name })}
              </Link>
            </Button>
          )}
          <Button asChild variant={featured ? 'outline' : 'default'} size="lg">
            <Link href="/shop">{t('browseAllBlends')}</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-10 text-sm italic">{t('tagline')}</p>
        <div className="text-muted-foreground mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs tracking-wide">
          {PAYMENT_METHODS.map((method) => (
            <span key={method}>{method}</span>
          ))}
        </div>
      </Container>
    </section>
  );
};
