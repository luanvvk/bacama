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

// Orders carry their ref in the URL and are read straight from the DB, so
// refreshing doesn't lose them. Orders still awaiting payment go back to /pay.
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
