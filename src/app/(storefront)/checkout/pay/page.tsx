import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { CheckoutSteps } from '../_components/CheckoutSteps';
import { PaymentProcessing } from './_components/PaymentProcessing';

interface CheckoutPayPageProps {
  searchParams: Promise<{ ref?: string }>;
}

const CheckoutPayPage = async ({ searchParams }: CheckoutPayPageProps) => {
  const { ref } = await searchParams;

  return (
    <>
      <main>
        <Container className="py-8">
          <CheckoutSteps currentStep={2} />
          <div className="mt-6">
            <PaymentProcessing orderRef={ref} />
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default CheckoutPayPage;
