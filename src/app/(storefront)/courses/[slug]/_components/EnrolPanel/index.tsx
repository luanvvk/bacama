'use client';

import Link from 'next/link';
import { Show } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

import { type CourseDetail } from '@/services/courses/map-course';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceTag } from '@/components/shop/PriceTag';

export interface EnrolPanelProps {
  course: CourseDetail;
}

export const EnrolPanel = ({ course }: EnrolPanelProps) => {
  const t = useTranslations('CourseDetail');

  const formatLabels: Record<CourseDetail['format'], string> = {
    online: t('formatOnline'),
    'in-person': t('formatInPerson'),
    hybrid: t('formatHybrid'),
  };
  const formatLabel = formatLabels[course.format];
  const ctaLabel = course.format === 'in-person' ? t('bookSeat') : t('enrol');
  const isSoldOut =
    course.seatLimited &&
    course.sessions.length > 0 &&
    course.sessions.every((session) => session.seatsLeft === 0);

  return (
    <div className="lg:sticky lg:top-24">
      <p className="text-primary font-mono text-xs tracking-widest uppercase">
        {course.meta ? `${formatLabel} · ${course.meta}` : formatLabel}
      </p>
      <h1 className="font-heading mt-2 text-3xl sm:text-4xl">{course.name}</h1>
      <p className="text-muted-foreground mt-3">{course.description}</p>

      {course.availability && (
        <Badge variant={course.seatLimited ? 'warning' : 'success'} className="mt-4 w-fit">
          {course.availability}
        </Badge>
      )}

      <div className="my-6 border-y py-4">
        <PriceTag priceVnd={course.priceVnd} className="text-3xl" />
      </div>

      <Show when="signed-out">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">{t('loginToEnrol')}</Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isSoldOut}
          onClick={() => toast(t('enrolNotReady'))}
        >
          {isSoldOut ? t('soldOut') : ctaLabel}
        </Button>
      </Show>
    </div>
  );
};
