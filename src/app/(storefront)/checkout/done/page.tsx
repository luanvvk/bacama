import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { CheckoutSteps } from '../_components/CheckoutSteps';
import { OrderConfirmation } from './_components/OrderConfirmation';

const CheckoutDonePage = () => (
  <>
    <main>
      <Container className="py-8">
        <CheckoutSteps currentStep={3} />
        <div className="mt-6">
          <OrderConfirmation />
        </div>
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default CheckoutDonePage;
