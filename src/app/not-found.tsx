import { ErrorState } from '@/components/layout/ErrorState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

const NotFound = () => (
  <>
    <Header />
    <ErrorState
      title="That page has gone missing."
      description="It may have moved, sold out, or never made it out of the notebook. Let us take you back to the counter."
    />
    <Footer />
  </>
);

export default NotFound;
