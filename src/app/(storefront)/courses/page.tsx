import Link from 'next/link';
import { Lock } from 'lucide-react';

import { COURSES } from '@/constants/courses';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Container } from '@/components/layout/Container';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Heading, Text } from '@/components/ui/Typography';

import { CoursesBrowser } from './_components/CoursesBrowser';

const ANNOUNCEMENTS = [
  `All courses · ${COURSES.length}`,
  'First lesson free',
  'Certificate on completion',
];

const CoursesPage = () => (
  <>
    <AnnouncementBar items={ANNOUNCEMENTS} />
    <main>
      <Container>
        <Breadcrumb className="pt-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Workshops</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6">
          <p className="text-primary font-mono text-xs tracking-widest uppercase">
            Taught by the roaster and the baker
          </p>
          <Heading as="h1" size="lg" className="mt-2 max-w-lg">
            All courses
          </Heading>
          <Text variant="muted" className="mt-3 max-w-prose">
            Watch the first lesson of every online course free. Enrol and your progress is saved.
          </Text>

          <div className="border-primary bg-primary/5 mt-6 flex flex-wrap items-center gap-4 rounded-lg border p-4">
            <Lock className="text-primary size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-52 flex-1">
              <p className="text-sm font-semibold">Public — no sign-in needed to browse</p>
              <p className="text-muted-foreground text-sm">
                Sign in only when you want to watch a full lesson or save your progress.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/me">To student page →</Link>
            </Button>
          </div>
        </div>

        <CoursesBrowser />
      </Container>
    </main>
    <Footer variant="simple" />
  </>
);

export default CoursesPage;
