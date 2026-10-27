import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { orderAccessCookieName, verifyOrderAccessToken } from '@/lib/order-access';
import { getAuthProvider } from '@/lib/providers/auth';
import { Heading, Text } from '@/components/ui/Typography';
import { getOrderByRef } from '@/services/orders/get-order-by-ref';
import { canShowOrderDone, getOrderStatus } from '@/services/orders/get-order-status';

import { CheckoutSteps } from '../_components/CheckoutSteps';
import { OrderConfirmation } from './_components/OrderConfirmation';

interface CheckoutDonePageProps {
  searchParams: Promise<{ ref?: string }>;
}

const getViewer = async (ref: string) => {
  const token = (await cookies()).get(orderAccessCookieName(ref))?.value;
  const user = await getAuthProvider().getCurrentUser();
  return { userId: user?.id ?? null, hasAccessCookie: verifyOrderAccessToken(ref, token) };
};

const OrderReceived = async ({ orderRef }: { orderRef: string }) => {
  const t = await getTranslations('OrderConfirmation');
  return (
    <>
      <main>
        <Container className="py-8">
          <div className="py-6 text-center">
            <Heading as="h1" size="lg">
              {t('receivedTitle')}
            </Heading>
            <Text variant="muted" className="mx-auto mt-3 max-w-prose">
              {t('receivedBody')}
            </Text>
            <p className="text-muted-foreground mt-4 font-mono text-xs tracking-widest uppercase">
              {t('receivedRef', { ref: orderRef })}
            </p>
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

// Orders carry their ref in the URL and are read straight from the DB, so
// refreshing doesn't lose them. Orders still awaiting payment go back to /pay.
const CheckoutDonePage = async ({ searchParams }: CheckoutDonePageProps) => {
  const { ref } = await searchParams;
  const status = ref ? await getOrderStatus(ref) : null;
  if (ref && status && !canShowOrderDone(status)) redirect(`/checkout/pay?ref=${ref}`);

  const order = ref ? await getOrderByRef(ref, await getViewer(ref)) : undefined;

  // A real order the visitor doesn't own: show the ref only, no PII.
  if (ref && status && order === null) return <OrderReceived orderRef={ref} />;

  return (
    <>
      <main>
        <Container className="py-8">
          <CheckoutSteps currentStep={3} />
          <div className="mt-6">
            <OrderConfirmation initialOrder={order} />
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default CheckoutDonePage;
