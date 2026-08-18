import { notFound } from 'next/navigation';

import { getProductBySlug } from '@/services/catalog/get-product-by-slug';
import { getProducts } from '@/services/catalog/get-products';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
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

import { BuyBox } from './_components/BuyBox';
import { ProductGallery } from './_components/ProductGallery';
import { ProductTabs } from './_components/ProductTabs';

// Prerendered per product, refreshed hourly — stock and roast freshness change
// during the day, so it can't be baked once at build time (task 1.10).
export const revalidate = 3600;

export const generateStaticParams = async () => {
  const products = await getProducts();

  return products.map((product) => ({ slug: product.slug }));
};

const ANNOUNCEMENTS = ['Roasted in-house, every batch', 'Shipped within 24h of roasting'];

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const images = product.images ?? [product.imageUrl];

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
                <BreadcrumbLink href="/shop">Coffee</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <ProductGallery images={images} alt={product.name} />
            <BuyBox product={product} />
          </div>

          <ProductTabs brewGuide={product.brewGuide} originStory={product.originStory} />
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default ProductPage;
