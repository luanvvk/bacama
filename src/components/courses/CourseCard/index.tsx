'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { type Course } from '@/services/courses/map-course';
import { Badge } from '@/components/ui/Badge';
import { CardMedia } from '@/components/ui/CardMedia';
import { PriceTag } from '@/components/shop/PriceTag';

export interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const t = useTranslations('CourseCard');
  const formatLabels: Record<Course['format'], string> = {
    online: t('formatOnline'),
    'in-person': t('formatInPerson'),
    hybrid: t('formatHybrid'),
  };
  const formatLabel = formatLabels[course.format];
  const previewHref = '/learn';
  const enrolHref = '/me';

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border">
      <Link href={previewHref} aria-label={`Preview ${course.name}`}>
        <CardMedia
          src={course.imageUrl}
          alt={course.name}
          aspect="landscape"
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="rounded-none"
          fallback={<Badge variant="outline">{formatLabel}</Badge>}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {course.meta ? `${formatLabel} · ${course.meta}` : formatLabel}
        </p>
        <h2 className="font-heading text-xl">
          <Link href={previewHref}>{course.name}</Link>
        </h2>
        <p className="text-muted-foreground text-sm">{course.description}</p>

        <div className="mt-auto flex flex-wrap items-baseline gap-3 border-t pt-3.5">
          {course.availability && (
            <Badge variant={course.seatLimited ? 'warning' : 'success'}>
              {course.availability}
            </Badge>
          )}
          <PriceTag priceVnd={course.priceVnd} className="ml-auto" />
          <Link href={enrolHref} className="text-primary text-sm font-medium hover:underline">
            {course.ctaLabel} →
          </Link>
        </div>
      </div>
    </article>
  );
};
