import { CartDrawer } from '@/components/layout/CartDrawer';
import { Header } from '@/components/layout/Header';

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
    <CartDrawer />
  </>
);

export default StorefrontLayout;
