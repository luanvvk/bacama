import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { getActiveAnnouncements } from '@/services/sites/get-active-announcements';
import { getSiteBySlug } from '@/services/sites/get-site-by-slug';
import { formatOpening, getSites } from '@/services/sites/get-sites';

import { SiteMap } from './_components/SiteMap';

export const revalidate = 3600;

export const generateStaticParams = async () => {
  const sites = await getSites();

  return sites.map((site) => ({ slug: site.slug }));
};

const SitePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const [t, site] = await Promise.all([getTranslations('Site'), getSiteBySlug(slug)]);

  if (!site) notFound();

  const announcements = await getActiveAnnouncements(slug);
  const hours = site.hoursTimes ? `${site.hoursDays} · ${site.hoursTimes}` : site.hoursDays;
  // Only a site that actually stocks something gets a map. The other two seeded
  // sites are roadmap placeholders with invented addresses (BUILD-PLAN.md D11) —
  // a map pin would present them as real places you can walk to today.
  const showMap = site.servesMenu || site.servesBakery;
  const hasAside = showMap || Boolean(site.imageUrl);

  return (
    <>
      <AnnouncementBar items={[site.city, hours]} />
      <main>
        <Container>
          <Breadcrumb className="pt-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t('breadcrumbHome')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/#sites">{t('breadcrumbCafes')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{site.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div
            className={cn(
              'gap-10 py-8',
              hasAside ? 'grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-14' : 'max-w-2xl',
            )}
          >
            <div>
              <Text variant="eyebrow" className="text-primary">
                {site.city}
              </Text>
              <Heading as="h1" size="lg" className="mt-2">
                {site.name}
              </Heading>

              {site.comingSoon && site.opensAt && (
                <Badge variant="warning" className="mt-4">
                  {t('openingSince', { date: formatOpening(site.opensAt) })}
                </Badge>
              )}

              <dl className="mt-6 space-y-4 border-t pt-6 text-sm">
                <div>
                  <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                    {t('addressLabel')}
                  </dt>
                  <dd className="mt-1">{site.address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                    {t('hoursLabel')}
                  </dt>
                  <dd className="mt-1">
                    {site.hoursDays}
                    {site.hoursTimes && (
                      <>
                        {' · '}
                        <b>{site.hoursTimes}</b>
                      </>
                    )}
                  </dd>
                </div>
                {site.addressNote && (
                  <div>
                    <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                      {t('onSiteLabel')}
                    </dt>
                    <dd className="mt-1">{site.addressNote}</dd>
                  </div>
                )}
                {site.todaysRoast && (
                  <div>
                    <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
                      {t('houseRoastLabel')}
                    </dt>
                    <dd className="mt-1">
                      <Link
                        href={`/product/${site.todaysRoast.slug}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {site.todaysRoast.name} →
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>

              {announcements.length > 0 && (
                <section className="mt-8 border-t pt-6">
                  <Heading as="h2" size="sm">
                    {t('whatsOn')}
                  </Heading>
                  <ul className="mt-3 space-y-3">
                    {announcements.map((announcement) => (
                      <li key={announcement.id} className="border-l-primary border-l-2 pl-3">
                        <p className="font-medium">{announcement.title}</p>
                        <Text variant="muted">{announcement.body}</Text>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Only offered where this site actually has drinks or bakery of
                  its own — a site with no items must not advertise collection. */}
              {(site.servesMenu || site.servesBakery) && (
                <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
                  {site.servesMenu && (
                    <Button asChild>
                      <Link href="/menu">{t('drinksMenu')}</Link>
                    </Button>
                  )}
                  {site.servesBakery && (
                    <Button asChild variant={site.servesMenu ? 'outline' : 'default'}>
                      <Link href="/bakery">{t('todaysBakery')}</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {hasAside && (
              <div className="space-y-6">
                {site.imageUrl && (
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={site.imageUrl}
                      alt={`Bacama ${site.name}`}
                      fill
                      priority
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {showMap && <SiteMap address={site.address} name={site.name} />}
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer variant="simple" />
    </>
  );
};

export default SitePage;
