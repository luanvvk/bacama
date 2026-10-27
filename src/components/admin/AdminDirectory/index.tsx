'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatVnd } from '@/lib/format-price';
import type { AdminCourse } from '@/services/courses/get-admin-courses';
import { formatSessionDate } from '@/services/courses/map-course';

export interface AdminDirectoryProps {
  courses: AdminCourse[];
  students: number;
}

export const AdminDirectory = ({ courses, students }: AdminDirectoryProps) => {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = courses.filter((course) =>
    `${course.name} ${course.format}`.toLowerCase().includes(needle),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {courses.length} courses · {students} students
        </p>
        <h1 className="font-heading mt-2 text-2xl font-semibold">Courses</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Price, instructor, capacity and start date. Lesson editing lives in the teacher console.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses…"
              aria-label="Search courses"
              className="pl-9"
            />
          </div>
          {visible.length === 0 ? (
            <p className="text-muted-foreground text-sm">No courses found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Starts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.name}
                      {course.meta && (
                        <p className="text-muted-foreground text-xs">{course.meta}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.format === 'online' ? 'success' : 'outline'}>
                        {course.format}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{formatVnd(course.priceVnd)}</TableCell>
                    <TableCell>{course.instructorName ?? '—'}</TableCell>
                    <TableCell className="font-mono">
                      {course.seatCapacity === null
                        ? `${course.enrolled} / ∞`
                        : `${course.seatsBooked} / ${course.seatCapacity}`}
                    </TableCell>
                    <TableCell className="font-mono">
                      {course.format === 'online'
                        ? 'Anytime'
                        : course.nextStartsAt
                          ? formatSessionDate(course.nextStartsAt)
                          : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
