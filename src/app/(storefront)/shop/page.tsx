import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { getProducts } from '@/services/catalog/get-products';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

import { ShopBrowser } from './_components/ShopBrowser';

const ANNOUNCEMENTS = [
  "Today's roast · Đà Lạt Washed",
  'Free shipping over 500,000 ₫',
  'COD nationwide',
];

const ShopPage = async () => {
  const products = await getProducts();

  return (
    <>
      <AnnouncementBar items={ANNOUNCEMENTS} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Coffee & Bakery</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <ShopBrowser products={products} />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default ShopPage;
