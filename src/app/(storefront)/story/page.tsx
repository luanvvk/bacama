import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';
import { getActiveAnnouncements } from '@/services/sites/get-active-announcements';

export const revalidate = 3600;

type Chapter = {
  year: string;
  label: string;
  title: string;
  paragraphs: string[];
  alt?: string;
  caption?: string;
};

type Value = {
  number: string;
  title: string;
  description: string;
};

type Person = {
  name: string;
  role: string;
  description: string;
};

const CHAPTER_MEDIA: Array<{ image: string } | undefined> = [
  {
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=72',
  },
  undefined,
  {
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=72',
  },
  undefined,
];

const PEOPLE_MEDIA = [
  'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=620&q=72',
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=620&q=72',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=620&q=72',
];

const StoryPage = async () => {
  const t = await getTranslations('StoryPage');
  const chapters = t.raw('chapters') as Chapter[];
  const values = t.raw('values') as Value[];
  const people = t.raw('people') as Person[];
  const announcements = await getActiveAnnouncements();

  return (
    <>
      <AnnouncementBar items={[t('tagline'), ...announcements.map(({ title }) => title)]} />
      <main>
        <section className="py-14 text-center sm:py-20">
          <Container>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('eyebrow')}
            </p>
            <Heading as="h1" size="xl" className="mx-auto mt-4 max-w-xl text-4xl sm:text-6xl">
              {t('heading')}
            </Heading>
            <Text variant="lead" className="text-muted-foreground mx-auto mt-6 max-w-2xl italic">
              {t('lead')}
            </Text>
            <div className="relative mt-10 aspect-[21/9] overflow-hidden rounded-lg">
              <Image
                src="https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1600&q=72"
                alt={t('heroImageAlt')}
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
            {chapters.map((chapter, index) => (
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
                  {CHAPTER_MEDIA[index] && (
                    <figure className="mt-6">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                        <Image
                          src={CHAPTER_MEDIA[index]!.image}
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
              {t('quote')}
            </blockquote>
          </Container>
        </section>

        <section className="bg-accent border-y py-14 sm:py-16">
          <Container>
            <div className="mb-8">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('valuesEyebrow')}
              </p>
              <Heading as="h2" size="lg" className="mt-3">
                {t('valuesHeading')}
              </Heading>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {values.map((value) => (
                <div key={value.number}>
                  <p className="text-primary font-mono text-xs tracking-widest">{value.number}</p>
                  <h3 className="font-heading mt-3 text-xl font-semibold">{value.title}</h3>
                  <Text className="text-muted-foreground mt-3">{value.description}</Text>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14 sm:py-16">
          <Container>
            <div className="mb-8">
              <p className="text-primary font-mono text-xs tracking-widest uppercase">
                {t('peopleEyebrow')}
              </p>
              <Heading as="h2" size="lg" className="mt-3">
                {t('peopleHeading')}
              </Heading>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {people.map((person, index) => (
                <article key={person.name}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                    <Image
                      src={PEOPLE_MEDIA[index]}
                      alt={person.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-primary mt-4 font-mono text-xs tracking-widest uppercase">
                    {person.role}
                  </p>
                  <h3 className="font-heading mt-2 text-xl font-semibold">{person.name}</h3>
                  <Text className="text-muted-foreground mt-2">{person.description}</Text>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="dark bg-background py-16">
          <Container>
            <p className="text-primary font-mono text-xs tracking-widest uppercase">
              {t('visitEyebrow')}
            </p>
            <Heading as="h2" size="lg" className="mt-3 max-w-xl">
              {t('visitHeadingLead')} <em>{t('visitHeadingEmphasis')}</em>
            </Heading>
            <Text variant="lead" className="text-muted-foreground mt-4 max-w-xl">
              {t('visitLead')}
            </Text>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/#sites">{t('findCafe')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/shop">{t('shopRoast')}</Link>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StoryPage;
