import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Heading, Text } from '@/components/ui/Typography';
import { toAppLocale } from '@/lib/localize';
import { requireUser } from '@/lib/auth/guards';
import { getUserEnrollments } from '@/services/enrollments/get-user-enrollments';
import { getLocale, getTranslations } from 'next-intl/server';
import { EnrollmentList } from './_components/EnrollmentList';

const MeLearningPage = async () => {
  const [user, t] = await Promise.all([requireUser(), getTranslations('MeLearning')]);
  const locale = toAppLocale(await getLocale());
  const enrollments = await getUserEnrollments(user.id, locale);

  return (
    <>
      <main>
        <Container>
          <div className="mx-auto max-w-2xl py-16">
            <Text variant="eyebrow">{t('eyebrow')}</Text>
            <Heading as="h1" size="lg" className="mt-3">
              {t('title')}
            </Heading>
            <Text variant="lead" className="text-muted-foreground mt-4">
              {t('description')}
            </Text>
            <EnrollmentList enrollments={enrollments} />
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default MeLearningPage;
