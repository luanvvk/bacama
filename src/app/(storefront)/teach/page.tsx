import { Construction } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { GuestGate } from '@/components/auth/GuestGate';

const TeachPage = async () => {
  const t = await getTranslations('Teach');

  return (
    <>
      <main>
        <Container>
          <GuestGate
            icon={Construction}
            eyebrow={t('eyebrow')}
            title={t('title')}
            description={t('description')}
            primaryAction={{ label: t('browseCourses'), href: '/courses' }}
            secondaryAction={{ label: t('backToShop'), href: '/shop' }}
          />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default TeachPage;
