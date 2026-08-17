'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  ControlledCheckbox,
  ControlledInput,
  ControlledSelect,
  ControlledTextarea,
} from '@/components/form';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { Product } from '@/constants/products';
import { toast } from '@/lib/toast';

const productSchema = z.object({
  name: z.string().min(2, 'Enter a product name.'),
  description: z.string().min(10, 'Add a useful product description.'),
  origin: z.string().optional(),
  roastLevel: z.string().optional(),
  price: z.string().regex(/^\d+$/, 'Enter a whole VND amount.'),
  stock: z.string().regex(/^\d+$/, 'Enter a whole stock quantity.'),
  reorderPoint: z.string().regex(/^\d+$/, 'Enter a whole reorder point.'),
  featured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductEditorProps {
  product: Product;
}

export const ProductEditor = ({ product }: ProductEditorProps) => {
  const { control, handleSubmit } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      origin: product.origin ?? '',
      roastLevel: product.roastLevel ?? '',
      price: String(product.priceVnd),
      stock: product.id === 'dalat-washed' ? '42' : '12',
      reorderPoint: '12',
      featured: product.id === 'dalat-washed',
    },
  });

  const onSubmit = () =>
    toast(`Saved ${product.name} locally. Connect a catalogue service to persist it.`);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ControlledInput control={control} name="name" label="Product name" />
            <ControlledInput control={control} name="origin" label="Origin" />
            <ControlledTextarea
              control={control}
              name="description"
              label="Description"
              className="sm:col-span-2"
            />
            <ControlledSelect
              control={control}
              name="roastLevel"
              label="Roast level"
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Medium', value: 'medium' },
                { label: 'Dark', value: 'dark' },
              ]}
              placeholder="Select roast level"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price & stock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <ControlledInput
              control={control}
              name="price"
              label="Price · VND"
              inputMode="numeric"
            />
            <ControlledInput control={control} name="stock" label="Stock now" inputMode="numeric" />
            <ControlledInput
              control={control}
              name="reorderPoint"
              label="Reorder point"
              inputMode="numeric"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <ControlledCheckbox
              control={control}
              name="featured"
              label="Show this product in Today's stock"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-5">
            <img
              src={product.imageUrl}
              alt=""
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
            <div>
              <p className="font-medium">Current photo</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Image uploads require the storage service.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => toast('Photo uploads are not wired up yet.')}
            >
              Replace photo
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shop</span>
              <Badge variant="success">Listed</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product URL</span>
              <code>/product/{product.slug}</code>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 xl:col-span-2">
        <Button type="submit">Save changes</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => toast('Hiding products is not wired up yet.')}
        >
          Pause listing
        </Button>
      </div>
    </form>
  );
};
