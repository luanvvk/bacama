import { notFound } from 'next/navigation';

import { ProductEditor } from '@/components/admin/ProductEditor';
import { Badge } from '@/components/ui/Badge';
import { getProductBySlug } from '@/constants/products';

interface AdminProductEditPageProps {
  params: Promise<{ slug: string }>;
}

const AdminProductEditPage = async ({ params }: AdminProductEditPageProps) => {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Catalogue / {product.name}
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">Edit product</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Preview changes before the catalogue service is connected.
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </div>
      <ProductEditor product={product} />
    </div>
  );
};

export default AdminProductEditPage;
