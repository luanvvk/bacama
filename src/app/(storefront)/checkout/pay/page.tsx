import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { CheckoutSteps } from '../_components/CheckoutSteps';
import { PaymentProcessing } from './_components/PaymentProcessing';

const CheckoutPayPage = () => (
  <>
    <main>
      <Container className="py-8">
        <CheckoutSteps currentStep={2} />
        <div className="mt-6">
          <PaymentProcessing />
        </div>
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default CheckoutPayPage;
