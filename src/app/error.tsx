'use client';

import { ErrorState } from '@/components/layout/ErrorState';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

const GlobalErrorPage = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <>
    <Header />
    <ErrorState
      title="The oven needs a minute."
      description="Something went wrong while we were bringing this page out. Try again, or return to the shop."
      actionLabel="Try again"
      onAction={reset}
    />
    <Footer />
  </>
);

export default GlobalErrorPage;
