'use client';

import { useMemo, useState } from 'react';

import { COURSES, type CourseFormat } from '@/constants/courses';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { CourseCard } from '@/components/courses/CourseCard';

const FORMAT_OPTIONS: { value: CourseFormat | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' },
];

type SortOrder = 'popular' | 'price-asc' | 'price-desc';

const sortCourses = (courses: typeof COURSES, order: SortOrder) => {
  if (order === 'price-asc') return [...courses].sort((a, b) => a.priceVnd - b.priceVnd);
  if (order === 'price-desc') return [...courses].sort((a, b) => b.priceVnd - a.priceVnd);
  return courses;
};

export const CoursesBrowser = () => {
  const [format, setFormat] = useState<CourseFormat | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('popular');

  const filteredCourses = useMemo(() => {
    const filtered =
      format === 'all' ? COURSES : COURSES.filter((course) => course.format === format);
    return sortCourses(filtered, sortOrder);
  }, [format, sortOrder]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((option) => (
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
          <SelectTrigger aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Sort: popular</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCourses.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center text-sm">
          No courses match those filters.
        </p>
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
