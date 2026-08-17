import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bacama.vn';

const sitemap = (): MetadataRoute.Sitemap =>
  [
    '/',
    '/shop',
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
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date('2026-08-16') }));

export default sitemap;
