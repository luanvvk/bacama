import { redirect } from 'next/navigation';

import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import { getAuthProvider } from '@/lib/providers/auth';

import { RegisterForm } from './_components/RegisterForm';

type RegisterPageProps = {
  searchParams: Promise<{ redirect_url?: string | string[] }>;
};

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  const user = await getAuthProvider().getCurrentUser();

  if (user) redirect(getSafeRedirectPath((await searchParams).redirect_url));

  return (
    <>
      <main>
        <Container>
          <RegisterForm />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default RegisterPage;
