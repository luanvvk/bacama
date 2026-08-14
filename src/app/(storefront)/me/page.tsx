import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { GuestGate } from '@/components/auth/GuestGate';

const MePage = () => (
  <>
    <main>
      <Container>
        <GuestGate
          eyebrow="My page · not signed in"
          title="Pick up where you left off."
          description="Your courses, orders, and certificates live here. Sign in, or make an account if it's your first visit."
          primaryAction={{ label: 'Log in', href: '/login' }}
          secondaryAction={{ label: 'Browse the shop', href: '/shop' }}
          hint="You can browse without buying — you only need to sign in to watch lessons or track progress."
        />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default MePage;
