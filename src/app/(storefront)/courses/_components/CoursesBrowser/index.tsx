'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { type Course, type CourseFormat } from '@/services/courses/map-course';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { CourseCard } from '@/components/courses/CourseCard';

export interface CoursesBrowserProps {
  courses: Course[];
}

type SortOrder = 'popular' | 'price-asc' | 'price-desc';

const sortCourses = (courses: Course[], order: SortOrder) => {
  if (order === 'price-asc') return [...courses].sort((a, b) => a.priceVnd - b.priceVnd);
  if (order === 'price-desc') return [...courses].sort((a, b) => b.priceVnd - a.priceVnd);
  return courses;
};

export const CoursesBrowser = ({ courses }: CoursesBrowserProps) => {
  const t = useTranslations('Courses');
  const [format, setFormat] = useState<CourseFormat | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('popular');

  const formatOptions: { value: CourseFormat | 'all'; label: string }[] = [
    { value: 'all', label: t('formatAll') },
    { value: 'online', label: t('formatOnline') },
    { value: 'in-person', label: t('formatInPerson') },
    { value: 'hybrid', label: t('formatHybrid') },
  ];

  const filteredCourses = useMemo(() => {
    const filtered =
      format === 'all' ? courses : courses.filter((course) => course.format === format);
    return sortCourses(filtered, sortOrder);
  }, [courses, format, sortOrder]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={option.value === format ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormat(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger aria-label={t('sortLabel')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{t('sortPopular')}</SelectItem>
            <SelectItem value="price-asc">{t('sortPriceAsc')}</SelectItem>
            <SelectItem value="price-desc">{t('sortPriceDesc')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCourses.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">{t('noResults')}</p>
      ) : (
        <div className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};
