import type { MetadataRoute } from 'next';

import { getProducts } from '@/services/catalog/get-products';
import { getSites } from '@/services/sites/get-sites';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bacama.vn';

const STATIC_PATHS = [
  '/',
  '/shop',
  '/bakery',
  '/menu',
  '/courses',
  '/story',
  '/faq',
  '/contact',
  '/subscribe',
  '/wholesale',
  '/gift-cards',
  '/shipping-returns',
  '/accessibility',
  '/careers',
  '/press',
  '/cookies',
  '/terms',
  '/privacy',
];

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  // Detail routes come from the database so a new product or café is listed
  // without anyone remembering to edit this file.
  const [products, sites] = await Promise.all([getProducts(), getSites()]);

  const paths = [
    ...STATIC_PATHS,
    ...products.map((product) => `/product/${product.slug}`),
    ...sites.map((site) => `/sites/${site.slug}`),
  ];

  return paths.map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date('2026-08-18') }));
};

export default sitemap;
