import Image from 'next/image';
import Link from 'next/link';

import { type Course } from '@/constants/courses';
import { Badge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/shop/PriceTag';

export interface CourseCardProps {
  course: Course;
}

const FORMAT_LABEL: Record<Course['format'], string> = {
  online: 'Online',
  'in-person': 'In-person',
  hybrid: 'Hybrid',
};

export const CourseCard = ({ course }: CourseCardProps) => {
  const previewHref = '/learn';
  const enrolHref = '/me';

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border">
      <Link
        href={previewHref}
        className="bg-muted relative block aspect-16/10 overflow-hidden"
        aria-label={`Preview ${course.name}`}
      >
        <Image
          src={course.imageUrl}
          alt={course.name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {FORMAT_LABEL[course.format]} · {course.meta}
        </p>
        <h2 className="font-heading text-xl">
          <Link href={previewHref}>{course.name}</Link>
        </h2>
        <p className="text-muted-foreground text-sm">{course.description}</p>

        <div className="mt-auto flex flex-wrap items-baseline gap-3 border-t pt-3.5">
          <Badge variant={course.lowAvailability ? 'warning' : 'success'}>
            {course.availability}
          </Badge>
          <PriceTag priceVnd={course.priceVnd} className="ml-auto" />
          <Link href={enrolHref} className="text-primary text-sm font-medium hover:underline">
            {course.ctaLabel} →
          </Link>
        </div>
      </div>
    </article>
  );
};
