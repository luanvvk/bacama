import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { requireUser } from '@/lib/auth/guards';
import { getOrdersForUser } from '@/services/orders/get-orders-for-user';
import { OrdersList } from './_components/OrdersList';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const AccountPage = async () => {
  const [user, t] = await Promise.all([requireUser(), getTranslations('Account')]);
  const orders = await getOrdersForUser(user.id);

  return (
    <>
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t('breadcrumbOrders')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mx-auto max-w-2xl py-16">
            <Text variant="eyebrow">{t('eyebrow')}</Text>
            <Heading as="h1" size="lg" className="mt-3">
              {t('title')}
            </Heading>
            <Text variant="lead" className="text-muted-foreground mt-4">
              {t('description', { name: user.name })}
            </Text>
            <OrdersList orders={orders} />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/shop">{t('shop')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/account/profile">{t('profile')}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default AccountPage;
