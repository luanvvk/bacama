import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { requireUser } from '@/lib/auth/guards';
import { getAccountSummary } from '@/services/account/get-account-summary';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const MePage = async () => {
  const [user, t] = await Promise.all([requireUser(), getTranslations('Me')]);
  const summary = await getAccountSummary(user.id);

  return (
    <>
      <main>
        <Container>
          <div className="mx-auto max-w-2xl py-16">
            <Text variant="eyebrow">{t('eyebrow')}</Text>
            <Heading as="h1" size="lg" className="mt-3">
              {t('title', { name: user.name })}
            </Heading>
            <Text variant="lead" className="text-muted-foreground mt-4">
              {t('description')}
            </Text>
            <dl className="mt-6 flex gap-8">
              <div>
                <dt className="text-muted-foreground text-sm">{t('orderCount')}</dt>
                <dd className="text-2xl font-medium">{summary.orderCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-sm">{t('activeEnrollmentCount')}</dt>
                <dd className="text-2xl font-medium">{summary.activeEnrollmentCount}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/courses">{t('browseCourses')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/me/learning">{t('myLearning')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/account">{t('viewOrders')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default MePage;
