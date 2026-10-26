import { redirect } from 'next/navigation';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getOrderByRef } from '@/services/orders/get-order-by-ref';
import { canShowOrderDone, getOrderStatus } from '@/services/orders/get-order-status';

import { CheckoutSteps } from '../_components/CheckoutSteps';
import { OrderConfirmation } from './_components/OrderConfirmation';

interface CheckoutDonePageProps {
  searchParams: Promise<{ ref?: string }>;
}

// Real orders carry their ref in the URL and are read
// straight from the DB, so refreshing this page doesn't lose them the way
// the still-simulated flow (client-only Zustand state, no ref in the URL)
// does. See OrderConfirmation for the fallback.
const CheckoutDonePage = async ({ searchParams }: CheckoutDonePageProps) => {
  const { ref } = await searchParams;
  const status = ref ? await getOrderStatus(ref) : null;
  if (ref && status && !canShowOrderDone(status)) redirect(`/checkout/pay?ref=${ref}`);

  const order = ref ? await getOrderByRef(ref) : undefined;

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
