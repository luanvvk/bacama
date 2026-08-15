import Image from 'next/image';
import Link from 'next/link';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

const ANNOUNCEMENTS = [
  "Today's roast · Đà Lạt Washed",
  'Fresh bake · 05:14',
  'Site 3 opens September',
];

const CHAPTERS = [
  {
    year: '2017',
    label: 'The beginning',
    title: "My grandmother's pan, every Saturday morning",
    paragraphs: [
      'She roasted over a wood stove behind the house, turning by hand, waiting for the first crack before she took it off. No thermometer, no timer — she listened. We opened in 2017 with one 3 kg roaster and a glass cabinet.',
      'My mother had been baking bread for the neighbours for years. When we opened, she asked: “If you sell coffee, where do the pastries go?” So there were pastries.',
    ],
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=72',
    alt: 'Bread cooling on a rack',
    caption: 'The first bread at Ngô Quyền, 2017',
  },
  {
    year: '2019',
    label: 'To the farms',
    title: 'We drove to Cầu Đất and stopped buying through brokers',
    paragraphs: [
      'Three smallholder plots at 1,450–1,600 metres. We pay above market and buy the same lots every year, so the growers know in advance where the harvest goes. Since then, every bag we sell knows where it came from.',
    ],
  },
  {
    year: '2022',
    label: 'Teaching',
    title: 'Someone asked how to pour a heart, and a class began',
    paragraphs: [
      'It began as a Tuesday afternoon, four people, one espresso machine. Now it is an online course for people far away and a weekend class in Hội An for people who want to stand at the machine. We teach exactly how we work — nothing held back.',
    ],
    image:
      'https://images.unsplash.com/photo-1572490122747-3968b75ccf67?auto=format&fit=crop&w=900&q=72',
    alt: 'A latte art class',
    caption: 'Latte art class, Hội An',
  },
  {
    year: '2026',
    label: 'The third café',
    title: 'An Thuận — a roastery, a classroom, and a garden',
    paragraphs: [
      'In September we open our third café in Ngũ Hành Sơn. For the first time the roaster, the classroom and the seats share one roof — so you can smell today’s batch while drinking yesterday’s.',
    ],
  },
];

const VALUES = [
  [
    '01',
    'A roast date on every bag',
    'Not a use-by date — a roast date. You deserve to know how old your coffee is.',
  ],
  [
    '02',
    'Baked that morning, then gone',
    'We do not hold pastries overnight. If you arrive at two and the croissants are gone, that is the proof.',
  ],
  [
    '03',
    'Bought straight from the growers',
    'The same three farms, every year, above market price. Long relationships make consistent coffee.',
  ],
];

const PEOPLE = [
  [
    'Cô Hằng',
    'Owner & roaster',
    'Has roasted every batch since 2017. Still listens for first crack before checking the timer.',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=620&q=72',
  ],
  [
    'Chị Mai',
    'Head baker',
    'In at three in the morning. Her croissants are laminated by hand, never by machine.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=620&q=72',
  ],
  [
    'Anh Minh',
    'Instructor',
    'Teaches barista and cupping. Answers every student question within 24 hours.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=620&q=72',
  ],
];

const StoryPage = () => (
  <>
    <AnnouncementBar items={ANNOUNCEMENTS} />
    <main>
      <section className="py-14 text-center sm:py-20">
        <Container>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Our story · since 2017
          </p>
          <Heading as="h1" size="xl" className="mx-auto mt-4 max-w-xl text-4xl sm:text-6xl">
            One kitchen, one oven, one family.
          </Heading>
          <Text variant="lead" className="text-muted-foreground mx-auto mt-6 max-w-2xl italic">
            We did not start with a business plan. We started with my grandmother&apos;s roasting
            pan and my mother&apos;s oven.
          </Text>
          <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1447934143428-44e0ad3a4bc1?auto=format&fit=crop&w=1600&q=72"
              alt="The roastery in morning light"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <section>
        <Container>
          {CHAPTERS.map((chapter) => (
            <article
              key={chapter.year}
              className="grid gap-5 border-b py-12 last:border-0 sm:grid-cols-[140px_1fr] sm:gap-10 sm:py-16"
            >
              <div>
                <p className="font-heading text-primary text-4xl font-semibold">{chapter.year}</p>
                <p className="text-muted-foreground mt-2 font-mono text-xs tracking-widest uppercase">
                  {chapter.label}
                </p>
              </div>
              <div className="max-w-3xl">
                <Heading as="h2" size="md" className="max-w-xl">
                  {chapter.title}
                </Heading>
                {chapter.paragraphs.map((paragraph) => (
                  <Text key={paragraph} className="text-muted-foreground mt-4 max-w-2xl">
                    {paragraph}
                  </Text>
                ))}
                {chapter.image && (
                  <figure className="mt-6">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                      <Image
                        src={chapter.image}
                        alt={chapter.alt ?? ''}
                        fill
                        sizes="(min-width: 640px) 70vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="text-muted-foreground mt-2 font-mono text-xs tracking-widest uppercase">
                      {chapter.caption}
                    </figcaption>
                  </figure>
                )}
              </div>
            </article>
          ))}
          <blockquote className="font-heading text-foreground mx-auto max-w-2xl border-y py-12 text-center text-2xl italic sm:py-16 sm:text-3xl">
            “Good coffee has a date on it. If you won&apos;t print the roast date on the bag,
            don&apos;t sell it.”
          </blockquote>
        </Container>
      </section>

      <section className="bg-accent border-y py-14 sm:py-16">
        <Container>
          <div className="mb-8">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">How we work</p>
            <Heading as="h2" size="lg" className="mt-3">
              Three things we don&apos;t compromise.
            </Heading>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {VALUES.map(([number, title, description]) => (
              <div key={number}>
                <p className="text-primary font-mono text-xs tracking-widest">{number}</p>
                <h3 className="font-heading mt-3 text-xl font-semibold">{title}</h3>
                <Text className="text-muted-foreground mt-3">{description}</Text>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <div className="mb-8">
            <p className="text-primary font-mono text-xs tracking-widest uppercase">The family</p>
            <Heading as="h2" size="lg" className="mt-3">
              Who is behind the counter.
            </Heading>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PEOPLE.map(([name, role, description, image]) => (
              <article key={name}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="text-primary mt-4 font-mono text-xs tracking-widest uppercase">
                  {role}
                </p>
                <h3 className="font-heading mt-2 text-xl font-semibold">{name}</h3>
                <Text className="text-muted-foreground mt-2">{description}</Text>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="dark bg-background py-16">
        <Container>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">Come by</p>
          <Heading as="h2" size="lg" className="mt-3 max-w-xl">
            Sunday morning, <em>bring the family.</em>
          </Heading>
          <Text variant="lead" className="text-muted-foreground mt-4 max-w-xl">
            Three cafés in Da Nang and Hội An. Pastries from five, coffee roasted this week.
          </Text>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/#sites">Find a café</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/shop">Shop the roast</Link>
            </Button>
          </div>
        </Container>
      </section>
    </main>
    <Footer />
  </>
);

export default StoryPage;
