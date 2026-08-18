import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/utils';
import { formatOpening, getSites } from '@/services/sites/get-sites';

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five'];

const countWord = (count: number) => COUNT_WORDS[count] ?? String(count);

// Derived from the sites actually in the database, so opening a fourth site (or
// a third one going live) can't leave the headline overclaiming.
const buildHeadline = (open: number, upcoming: number) => {
  const today = `${countWord(open)} ${open === 1 ? 'café' : 'cafés'} today`;

  return upcoming === 0
    ? `${today}.`
    : `${today}, ${countWord(upcoming).toLowerCase()} more on the way.`;
};

export const CafesSection = async () => {
  const sites = await getSites();
  const openCount = sites.filter((site) => !site.comingSoon).length;

  return (
    <section id="sites" className="border-t py-16">
      <Container>
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">04 · Our cafés</p>
          <Heading as="h2" size="lg" className="mt-2 max-w-lg">
            {buildHeadline(openCount, sites.length - openCount)}
          </Heading>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site, index) => (
            <article key={site.id} className={cn('flex flex-col', site.comingSoon && 'opacity-80')}>
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
                {site.imageUrl ? (
                  <Image
                    src={site.imageUrl}
                    alt={`Bacama ${site.name}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-secondary flex h-full w-full items-center justify-center">
                    <Badge variant="warning">
                      {site.comingSoon && site.opensAt
                        ? `Opening · ${formatOpening(site.opensAt)}`
                        : site.city}
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-primary mt-3 font-mono text-xs tracking-widest uppercase">
                Site {String(index + 1).padStart(2, '0')} · {site.city}
              </p>
              <h3 className="font-heading mt-1 text-lg">
                <Link href={`/sites/${site.slug}`} className="hover:text-primary">
                  {site.name}
                </Link>
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {site.address}
                {site.addressNote && ` · ${site.addressNote}`}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {site.hoursDays}
                {site.hoursTimes && (
                  <>
                    {' · '}
                    <b className="text-foreground">{site.hoursTimes}</b>
                  </>
                )}
              </p>
              <div className="text-muted-foreground mt-auto flex items-center justify-between gap-3 border-t pt-3 text-sm">
                {site.comingSoon ? (
                  <span>Opening soon</span>
                ) : site.todaysRoast ? (
                  <span>
                    House roast ·{' '}
                    <Link
                      href={`/product/${site.todaysRoast.slug}`}
                      className="text-foreground font-bold hover:underline"
                    >
                      {site.todaysRoast.name}
                    </Link>
                  </span>
                ) : (
                  <span>Open today</span>
                )}
                <Link
                  href={`/sites/${site.slug}`}
                  className="text-primary shrink-0 font-medium hover:underline"
                >
                  Map &amp; hours →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};
