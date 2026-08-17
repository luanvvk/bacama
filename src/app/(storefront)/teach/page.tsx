import { Construction } from 'lucide-react';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { GuestGate } from '@/components/auth/GuestGate';

const TeachPage = () => (
  <>
    <main>
      <Container>
        <GuestGate
          icon={Construction}
          eyebrow="Teacher console · not set up yet"
          title="The teaching console isn't built yet."
          description="Lesson editing, video uploads, and student Q&A all need staff accounts and file storage we haven't wired up. Once those are in place, this becomes the real teacher console."
          primaryAction={{ label: 'Browse courses', href: '/courses' }}
          secondaryAction={{ label: 'Back to shop', href: '/shop' }}
        />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default TeachPage;
