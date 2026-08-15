import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/account', '/me', '/checkout'] },
  sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bacama.vn'}/sitemap.xml`,
});

export default robots;
