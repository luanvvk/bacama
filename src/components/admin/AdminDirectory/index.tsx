'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { COURSES } from '@/constants/courses';
import { toast } from '@/lib/toast';
import { formatVnd } from '@/lib/format-price';

type DirectoryKind = 'sites' | 'courses';

const SCREEN_COPY: Record<
  DirectoryKind,
  { title: string; eyebrow: string; description: string; action: string }
> = {
  sites: {
    title: 'Sites',
    eyebrow: '3 cafés · 2 open · 1 opens Sep',
    description: "Address, hours, today's roast, open or not.",
    action: 'Add café',
  },
  courses: {
    title: 'Courses',
    eyebrow: '4 courses · 1 online full · 3 enrolling · 84 students',
    description:
      'Price, instructor, capacity and start date. Lesson editing lives in the teacher console.',
    action: 'New course',
  },
};

const statusVariant = (status: string) =>
  status === 'Active' || status === 'Certified' || status === 'Live'
    ? 'success'
    : status === 'Pending' || status === 'Awaiting start' || status === 'Scheduled'
      ? 'warning'
      : 'outline';

export const AdminDirectory = ({ kind }: { kind: DirectoryKind }) => {
  const copy = SCREEN_COPY[kind];
  const [query, setQuery] = useState('');
  const matches = (value: string) => value.toLowerCase().includes(query.toLowerCase());

  const action = () => toast(`${copy.action} is not wired up yet.`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary font-mono text-xs tracking-widest uppercase">{copy.eyebrow}</p>
          <h1 className="font-heading mt-2 text-2xl font-semibold">{copy.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{copy.description}</p>
        </div>
        <Button onClick={action}>+ {copy.action}</Button>
      </div>

      {kind === 'sites' ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              'Site 01 · Da Nang',
              'Ngô Quyền',
              '27 Ngô Quyền, Hải Châu',
              '07:00–19:00',
              'Open',
              'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=240&q=70',
            ],
            [
              'Site 02 · Hội An',
              'Old town',
              '14 Phan Bội Châu, Minh An',
              '07:30–18:00',
              'Open',
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=240&q=70',
            ],
            [
              'Site 03 · Da Nang',
              'An Thuận',
              '8 An Thuận 12, Ngũ Hành Sơn',
              'Opens 09.2026',
              'Opens Sep',
              'https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=240&q=70',
            ],
          ].map(([name, area, address, hours, status, image]) => (
            <Card key={name}>
              <img src={image} alt="" className="h-36 w-full object-cover" />
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{name}</CardTitle>
                <Badge variant={statusVariant(status)}>{status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{area}</p>
                <p className="text-muted-foreground">{address}</p>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Hours</span>
                  <span className="font-mono text-xs">{hours}</span>
                </div>
                <Button variant="link" className="px-0" onClick={action}>
                  Edit site →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
                placeholder={`Search ${kind}…`}
                aria-label={`Search ${kind}`}
                className="pl-9"
              />
            </div>
            {kind === 'courses' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Starts</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COURSES.filter((course) => matches(`${course.name} ${course.format}`)).map(
                    (course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">
                          {course.name}
                          <p className="text-muted-foreground text-xs">{course.meta}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.format === 'online' ? 'success' : 'outline'}>
                            {course.format}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{formatVnd(course.priceVnd)}</TableCell>
                        <TableCell>Anh Minh</TableCell>
                        <TableCell className="font-mono">
                          {course.id === 'latte-art'
                            ? '42 / ∞'
                            : course.id === 'viennoiserie'
                              ? '5 / 8'
                              : '18 / ∞'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {course.format === 'online'
                            ? 'Anytime'
                            : course.id === 'viennoiserie'
                              ? '21 Sep'
                              : '1 Oct'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={action}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
