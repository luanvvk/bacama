import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Heading, Text } from '@/components/ui/Typography';
import { Container } from '@/components/layout/Container';

interface WorkshopTeaser {
  id: string;
  label: string;
  name: string;
  description: string;
  availability: string;
  priceVnd: string;
  ctaLabel: string;
  imageUrl: string;
  featured?: boolean;
}

const WORKSHOPS: WorkshopTeaser[] = [
  {
    id: 'latte-art',
    label: 'Online · 9 lessons',
    name: 'Latte Art',
    description:
      'Video lessons with live discussion, a photo-based exam. Learn at home, finish at a café.',
    availability: 'Lesson 1 free to watch',
    priceVnd: '790.000 ₫',
    ctaLabel: 'Free preview →',
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=820&q=72',
    featured: true,
  },
  {
    id: 'viennoiserie',
    label: 'In person · Hội An',
    name: 'Viennoiserie',
    description: 'A two-day weekend, eight people, French butter.',
    availability: '3 seats left · 21–22 Sep',
    priceVnd: '3.200.000 ₫',
    ctaLabel: 'Book a seat →',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=620&q=72',
  },
  {
    id: 'cupping-origin',
    label: 'Online',
    name: 'Cupping & Origin',
    description: 'Sơn La and Đà Lạt origins; a sensory-based final.',
    availability: 'Start any time',
    priceVnd: '1.290.000 ₫',
    ctaLabel: 'Enroll →',
    imageUrl:
      'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=620&q=72',
  },
];

export const WorkshopsSection = () => (
  <section className="border-t py-16">
    <Container>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">03 · Workshops</p>
          <Heading as="h2" size="lg" className="mt-2 max-w-lg">
            Taught by the people who bake at five.
          </Heading>
        </div>
        <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
          All courses →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {WORKSHOPS.map((workshop) => (
          <article key={workshop.id} className="flex flex-col">
            <Link
              href="/courses"
              className="bg-muted relative block aspect-4/5 overflow-hidden rounded-lg"
            >
              <Image
                src={workshop.imageUrl}
                alt={workshop.name}
                fill
                sizes={
                  workshop.featured
                    ? '(min-width: 1024px) 33vw, 100vw'
                    : '(min-width: 1024px) 25vw, 50vw'
                }
                className="object-cover"
              />
            </Link>
            <div className="mt-3 flex flex-1 flex-col">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {workshop.label}
              </p>
              <h3 className="font-heading mt-1 text-lg">
                <Link href="/courses">{workshop.name}</Link>
              </h3>
              <Text variant="muted" className="mt-1">
                {workshop.description}
              </Text>
              <Badge variant="success" className="mt-2 w-fit">
                {workshop.availability}
              </Badge>
              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <span className="font-mono font-bold tabular-nums">{workshop.priceVnd}</span>
                <Link href="/courses" className="text-primary text-sm font-medium hover:underline">
                  {workshop.ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Container>
  </section>
);
