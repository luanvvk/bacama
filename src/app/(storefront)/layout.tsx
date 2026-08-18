import { buildNavItems } from '@/constants/nav';
import { getBakeryItems } from '@/services/catalog/get-bakery-items';
import { getFeaturedProducts } from '@/services/catalog/get-featured-products';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Header } from '@/components/layout/Header';

const StorefrontLayout = async ({ children }: { children: React.ReactNode }) => {
  const [products, bakeryItems] = await Promise.all([getFeaturedProducts(), getBakeryItems()]);

  const navItems = buildNavItems(
    products.slice(0, 2).map((product) => ({
      label: product.name,
      href: `/product/${product.slug}`,
    })),
    bakeryItems.slice(0, 2).map((item) => ({ label: item.name, href: '/bakery' })),
  );

  return (
    <>
      <Header navItems={navItems} />
      {children}
      <CartDrawer />
    </>
  );
};

export default StorefrontLayout;
