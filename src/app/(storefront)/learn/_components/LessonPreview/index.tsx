'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lock, Play } from 'lucide-react';

import { COURSES } from '@/constants/courses';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Heading, Text } from '@/components/ui/Typography';

const course = COURSES[0];

const DISCUSSION_SAMPLE = [
  {
    author: 'Anh Minh',
    role: 'Teacher',
    when: '09:12',
    text: 'Reminder for everyone: milk at 60–65 °C only. Any hotter and the foam collapses before you finish the pour.',
  },
  {
    author: 'Thu Hà',
    when: '09:31',
    text: "My hearts keep leaning to the right. Is that because I'm tilting the jug?",
  },
  {
    author: 'Anh Minh',
    role: 'Teacher',
    when: '09:38',
    text: "Usually it's the cup angle, not the jug. Rewatch from 6:05 — there's a close-up of the cup tilt.",
  },
];

export const LessonPreview = () => {
  const { modules, preview } = course;
  if (!modules || !preview) return null;

  const handlePlayClick = () => toast('Sign in to watch the full lesson.');

  return (
    <div className="grid gap-10 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="border-primary bg-primary/5 flex flex-wrap items-center gap-3 rounded-lg border p-4 text-sm">
          <Lock className="text-primary size-4 shrink-0" aria-hidden="true" />
          <p className="min-w-52 flex-1">
            <b>You&rsquo;re watching the free preview.</b>{' '}
            <span className="text-muted-foreground">
              Sign in to save your progress and unlock paid lessons.
            </span>
          </p>
          <Button asChild size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">All courses →</Link>
          </Button>
        </div>

        <div className="bg-muted relative mt-6 aspect-video overflow-hidden rounded-lg">
          <Image src={course.imageUrl} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label="Play preview"
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          >
            <span className="bg-background/90 flex size-16 items-center justify-center rounded-full">
              <Play
                className="text-foreground ml-1 size-6"
                fill="currentColor"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        <p className="text-primary mt-6 font-mono text-xs tracking-widest uppercase">
          {preview.moduleLabel}
        </p>
        <Heading as="h1" size="md" className="mt-2">
          {preview.title}
        </Heading>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex flex-col gap-4 py-6">
              {preview.overview.map((paragraph, index) => (
                <Text key={index} variant="muted">
                  {paragraph}
                </Text>
              ))}
              <Button asChild className="w-fit">
                <Link href="/login">Sign in to track your progress</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <ul className="flex flex-col gap-2 py-6">
              {preview.documents.map((document) => (
                <li key={document.name} className="flex items-center gap-3 rounded-lg border p-3">
                  <Lock className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{document.name}</p>
                    <p className="text-muted-foreground text-xs">{document.size}</p>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs uppercase">
                    Sign in to download
                  </span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="flex flex-col gap-8">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">Course</p>
          <Heading as="h2" size="xs" className="mt-1">
            {course.name}
          </Heading>
          <p className="text-muted-foreground mt-1 font-mono text-xs">3 of 9 lessons · 33%</p>

          <div className="mt-4 flex flex-col gap-4">
            {modules.map((courseModule) => (
              <div key={courseModule.title}>
                <p className="text-muted-foreground mb-2 font-mono text-xs tracking-widest uppercase">
                  {courseModule.title}
                </p>
                <ul className="flex flex-col gap-1">
                  {courseModule.lessons.map((lesson) => (
                    <li
                      key={lesson.number}
                      className={cn(
                        'flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm',
                        lesson.current ? 'border-primary bg-primary/5' : 'border-transparent',
                      )}
                    >
                      <span className="text-muted-foreground font-mono text-xs">
                        {lesson.number}
                      </span>
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {lesson.completed ? '✓ ' : ''}
                        {lesson.duration}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Discussion</p>
          </div>
          <ul className="flex flex-col gap-4 px-4 py-4">
            {DISCUSSION_SAMPLE.map((message, index) => (
              <li key={index} className="text-sm">
                <p className="flex items-baseline gap-2">
                  <span className="font-medium">{message.author}</span>
                  {message.role && (
                    <span className="text-primary font-mono text-[10px] tracking-widest uppercase">
                      {message.role}
                    </span>
                  )}
                  <span className="text-muted-foreground ml-auto font-mono text-xs">
                    {message.when}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1">{message.text}</p>
              </li>
            ))}
          </ul>
          <div className="border-t p-3">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/login">Log in to join the discussion</Link>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};
