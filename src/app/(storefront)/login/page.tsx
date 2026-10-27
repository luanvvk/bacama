import { redirect } from 'next/navigation';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import { getAuthProvider } from '@/lib/providers/auth';

import { LoginForm } from './_components/LoginForm';

type LoginPageProps = {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const user = await getAuthProvider().getCurrentUser();

  if (user) redirect(getSafeRedirectPath((await searchParams).redirect_url));

  return (
    <>
      <main>
        <Container>
          <LoginForm />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default LoginPage;
