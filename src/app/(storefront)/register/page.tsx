import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';

import { RegisterForm } from './_components/RegisterForm';

const RegisterPage = () => (
  <>
    <main>
      <Container>
        <RegisterForm />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default RegisterPage;
