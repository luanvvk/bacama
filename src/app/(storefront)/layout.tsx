import { getLocale } from 'next-intl/server';

import { buildNavItems } from '@/constants/nav';
import { toAppLocale } from '@/lib/localize';
import { getAuthProvider } from '@/lib/providers/auth';
import { getBakeryItems } from '@/services/catalog/get-bakery-items';
import { getFeaturedProducts } from '@/services/catalog/get-featured-products';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CartHydrator } from '@/components/layout/CartHydrator';
import { Header } from '@/components/layout/Header';

const StorefrontLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = toAppLocale(await getLocale());
  const [products, bakeryItems, user] = await Promise.all([
    getFeaturedProducts(locale),
    getBakeryItems(locale),
    getAuthProvider().getCurrentUser(),
  ]);

  const navItems = buildNavItems(
    products.slice(0, 2).map((product) => ({
      label: product.name,
      href: `/product/${product.slug}`,
    })),
    bakeryItems.slice(0, 2).map((item) => ({ label: item.name, href: '/bakery' })),
  );

  return (
    <>
      <Header navItems={navItems} role={user?.role ?? null} />
      {children}
      <CartDrawer />
      <CartHydrator />
    </>
  );
};

export default StorefrontLayout;
