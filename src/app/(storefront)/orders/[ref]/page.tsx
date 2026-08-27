import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { OrderTrackingLookup } from './_components/OrderTrackingLookup';

interface OrderTrackingPageProps {
  params: Promise<{ ref: string }>;
}

const OrderTrackingPage = async ({ params }: OrderTrackingPageProps) => {
  const { ref } = await params;

  return (
    <>
      <main>
        <Container className="py-10">
          <OrderTrackingLookup orderRef={ref} />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default OrderTrackingPage;
