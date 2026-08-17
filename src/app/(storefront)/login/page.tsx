import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { LoginForm } from './_components/LoginForm';

const LoginPage = () => (
  <>
    <main>
      <Container>
        <LoginForm />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default LoginPage;
