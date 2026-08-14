import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { CheckoutForm } from './_components/CheckoutForm';
import { CheckoutSteps } from './_components/CheckoutSteps';

const CheckoutPage = () => (
  <>
    <main>
      <Container className="py-8">
        <CheckoutSteps currentStep={1} />
        <div className="mt-6">
          <CheckoutForm />
        </div>
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default CheckoutPage;
