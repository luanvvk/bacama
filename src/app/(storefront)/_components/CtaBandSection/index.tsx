import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { getFeaturedProducts } from '@/services/catalog/get-featured-products';

const PAYMENT_METHODS = ['ZaloPay', 'MoMo', 'VNPay QR', 'COD', 'Visa · MC', 'GHN'];

export const CtaBandSection = async () => {
  // Named the featured bag rather than a hardcoded slug — the previous link
  // pointed at Đà Lạt Washed, which the real-data seed retired.
  const [featured] = await getFeaturedProducts();

  return (
    <section className="dark bg-background border-t">
      <Container className="py-16 text-center">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">05 · Order</p>
        <Heading as="h2" size="lg" className="mx-auto mt-3 max-w-xl">
          A bag roasted this morning, posted to your door.
        </Heading>
        <Text variant="lead" className="text-muted-foreground mx-auto mt-4 max-w-md">
          Pay with ZaloPay, MoMo, or cash on delivery. GHN ships nationwide in 2–3 days.
        </Text>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {featured && (
            <Button asChild size="lg">
              <Link href={`/product/${featured.slug}`}>Shop {featured.name}</Link>
            </Button>
          )}
          <Button asChild variant={featured ? 'outline' : 'default'} size="lg">
            <Link href="/shop">Browse all blends</Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-10 text-sm italic">
          Small roastery, daily batches, an early bake — Đà Nẵng, 2017.
        </p>
        <div className="text-muted-foreground mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs tracking-wide">
          {PAYMENT_METHODS.map((method) => (
            <span key={method}>{method}</span>
          ))}
        </div>
      </Container>
    </section>
  );
};
