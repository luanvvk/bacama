'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { PRODUCTS, type Product, type ProductCategory } from '@/constants/products';
import { formatVnd } from '@/lib/format-price';
import { toast } from '@/lib/toast';

type CatalogFilter = ProductCategory | 'all';

interface CatalogBrowserProps {
  title: string;
  description: string;
  filter: CatalogFilter;
  newLabel: string;
}

const stockFor = (product: Product) =>
  ({
    'dalat-washed': 42,
    'sonla-natural': 6,
    'house-blend': 31,
    'croissant-amandes': 0,
    'kouign-amann': 12,
    'three-origins-box': 19,
  })[product.id] ?? 0;

export const CatalogBrowser = ({ title, description, filter, newLabel }: CatalogBrowserProps) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'live' | 'low'>('all');

  const products = PRODUCTS.filter((product) => {
    const matchesCategory = filter === 'all' || product.category === filter;
    const matchesQuery = `${product.name} ${product.origin ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const stock = stockFor(product);
    const matchesStatus =
      status === 'all' || (status === 'live' ? stock > 0 : stock > 0 && stock <= 10);
    return matchesCategory && matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Catalogue · Site 01 Ngô Quyền
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast('CSV import is not wired up yet.')}>
            Import CSV
          </Button>
          <Button asChild>
            <Link href="/admin/catalog/dalat-washed/edit">+ {newLabel}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">Live</p>
            <p className="font-heading mt-2 text-2xl">
              {
                PRODUCTS.filter(
                  (product) =>
                    (filter === 'all' || product.category === filter) && stockFor(product) > 0,
                ).length
              }
            </p>
            <p className="text-muted-foreground text-xs">listed products</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">Total stock</p>
            <p className="font-heading mt-2 text-2xl">
              {PRODUCTS.filter((product) => filter === 'all' || product.category === filter).reduce(
                (total, product) => total + stockFor(product),
                0,
              )}
            </p>
            <p className="text-muted-foreground text-xs">units at Site 01</p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-muted-foreground font-mono text-xs uppercase">Running low</p>
            <p className="font-heading mt-2 text-2xl">
              {
                PRODUCTS.filter(
                  (product) =>
                    (filter === 'all' || product.category === filter) &&
                    stockFor(product) > 0 &&
                    stockFor(product) <= 10,
                ).length
              }
            </p>
            <p className="text-muted-foreground text-xs">needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, origin, roast…"
                aria-label="Search catalogue"
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-lg border p-1" aria-label="Filter by status">
              {(['all', 'live', 'low'] as const).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={status === value ? 'secondary' : 'ghost'}
                  onClick={() => setStatus(value)}
                  aria-pressed={status === value}
                >
                  {value === 'all' ? 'All' : value === 'live' ? 'Live' : 'Low'}
                </Button>
              ))}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stock = stockFor(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="size-10 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {product.origin ?? product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell className="font-mono tabular-nums">
                      {formatVnd(product.priceVnd)}
                    </TableCell>
                    <TableCell className="font-mono tabular-nums">{stock}</TableCell>
                    <TableCell>
                      {stock === 0 ? (
                        <Badge variant="destructive">Paused</Badge>
                      ) : stock <= 10 ? (
                        <Badge variant="warning">Low</Badge>
                      ) : (
                        <Badge variant="success">Live</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/catalog/${product.slug}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/product/${product.slug}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {products.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No products match these filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
