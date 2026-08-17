import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { GuestGate } from '@/components/auth/GuestGate';

const AccountPage = () => (
  <>
    <main>
      <Container>
        <Breadcrumb className="pt-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <GuestGate
          eyebrow="Your orders · not signed in"
          title="Sign in to see your orders."
          description="Every coffee and course order you've placed lives here once you're signed in."
          primaryAction={{ label: 'Log in', href: '/login' }}
          secondaryAction={{ label: 'Continue shopping', href: '/shop' }}
          hint="Already placed an order? You don't need an account to check out — you'll still get updates over Zalo."
        />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default AccountPage;
