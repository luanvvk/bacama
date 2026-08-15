import { ErrorState } from '@/components/layout/ErrorState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

const ServerErrorPage = () => (
  <>
    <Header />
    <ErrorState
      title="The oven needs a minute."
      description="Something went wrong while we were bringing this page out. Return to the shop and try again."
    />
    <Footer />
  </>
);

export default ServerErrorPage;
