import Image from 'next/image';
import Link from 'next/link';

import { Heading } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

interface CafeLocation {
  id: string;
  site: string;
  name: string;
  address: string;
  hours: string;
  todaysRoast: string;
  imageUrl: string;
  comingSoon?: boolean;
}

const CAFE_LOCATIONS: CafeLocation[] = [
  {
    id: 'ngo-quyen',
    site: 'Site 01 · Đà Nẵng',
    name: 'Ngô Quyền',
    address: '27 Ngô Quyền, Hải Châu · Pastries baked on site',
    hours: 'Mon–Sun · 07:00 – 19:00',
    todaysRoast: 'Đà Lạt W.',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=680&q=72',
  },
  {
    id: 'old-town',
    site: 'Site 02 · Hội An',
    name: 'Old Town',
    address: '14 Phan Bội Châu, Minh An · Weekend cupping',
    hours: 'Tue–Sun · 07:30 – 18:00',
    todaysRoast: 'Sơn La N.',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=680&q=72',
  },
  {
    id: 'an-thuan',
    site: 'Site 03 · Đà Nẵng · Opens Sep',
    name: 'An Thuận',
    address: '8 An Thuận 12, Ngũ Hành Sơn · Roastery, classroom, garden',
    hours: 'Opening · 09.2026',
    todaysRoast: '—',
    imageUrl:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=680&q=72',
    comingSoon: true,
  },
];

export const CafesSection = () => (
  <section id="sites" className="border-t py-16">
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">04 · Our cafés</p>
          <Heading as="h2" size="lg" className="mt-2 max-w-lg">
            Three cafés, one roastery.
          </Heading>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CAFE_LOCATIONS.map((cafe) => (
          <article key={cafe.id} className="flex flex-col">
            <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={cafe.imageUrl}
                alt={`${cafe.name} café frontage`}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="text-primary mt-3 font-mono text-xs tracking-widest uppercase">
              {cafe.site}
            </p>
            <h3 className="font-heading mt-1 text-lg">{cafe.name}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{cafe.address}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {cafe.hours.split(' · ')[0]} ·{' '}
              <b className="text-foreground">{cafe.hours.split(' · ')[1]}</b>
            </p>
            <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-3 text-sm">
              <span>{cafe.comingSoon ? 'Opening soon' : "Today's roast"}</span>
              <b className="text-foreground">{cafe.todaysRoast}</b>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 text-right">
        <Link href="#sites" className="text-primary text-sm font-medium hover:underline">
          Map &amp; hours →
        </Link>
      </p>
    </Container>
  </section>
);
