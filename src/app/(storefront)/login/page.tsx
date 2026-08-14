import { Clock } from 'lucide-react';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { GuestGate } from '@/components/auth/GuestGate';

const LoginPage = () => (
  <>
    <main>
      <Container>
        <GuestGate
          icon={Clock}
          eyebrow="Sign in · not available yet"
          title="Accounts are coming soon."
          description="We haven't wired up sign-in yet. You can browse, order, and check out without one — we'll let you know once accounts land."
          primaryAction={{ label: 'Browse the shop', href: '/shop' }}
        />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default LoginPage;
