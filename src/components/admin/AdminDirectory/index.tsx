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

type DirectoryKind = 'announcements' | 'sites' | 'courses' | 'staff' | 'students';

const ANNOUNCEMENTS = [
  [
    'New batch: Đà Lạt Washed',
    'Out this morning, 10% off 1 kg bags until Sunday.',
    'Live',
    'All sites · until 17 Aug',
  ],
  [
    'Site 03 opens in September',
    'An Thuận — a roastery, classroom and garden.',
    'Scheduled',
    'Starts 1 Sep · all sites',
  ],
  [
    'Viennoiserie · 3 seats left',
    '21–22 Sep in Hội An · French butter.',
    'Draft',
    'Site 02 · unscheduled',
  ],
];

const STAFF = [
  ['CH', 'Cô Hằng', 'hang@bacama.vn', 'Admin', 'All sites', 'Online now', 'Active'],
  ['AM', 'Anh Minh', 'minh@bacama.vn', 'Instructor', 'Site 02 · Hội An', '09:42', 'Active'],
  ['CM', 'Chị Mai', 'mai@bacama.vn', 'Staff', 'Site 01 · Ngô Quyền', '05:14', 'Active'],
  ['TR', 'Trang', 'trang@bacama.vn', 'Staff', 'Site 03 · An Thuận', 'Never', 'Pending'],
];

const STUDENTS = [
  ['LN', 'Lê Thị Ngọc', 'ngoc.le@email.vn', 'Latte Art', 33, 'Enrolled'],
  ['DK', 'Trần Đức Khôi', 'dockhoi@email.vn', 'Latte Art · Barista Foundations', 100, 'Certified'],
  ['TH', 'Nguyễn Thu Hà', 'thuha@email.vn', 'Viennoiserie · Hội An', 0, 'Awaiting start'],
  ['NP', 'Ngọc Phương', 'phuong.n@email.vn', 'Barista Foundations', 60, 'Enrolled'],
  ['MA', 'Phạm Minh Anh', 'minhanh@email.vn', 'Latte Art', 0, 'Just enrolled'],
];

const SCREEN_COPY: Record<
  DirectoryKind,
  { title: string; eyebrow: string; description: string; action: string }
> = {
  announcements: {
    title: 'Announcements',
    eyebrow: '2 live · 1 scheduled · 1 draft',
    description: 'Short notices on the home page, per site or across all sites.',
    action: 'New announcement',
  },
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
  staff: {
    title: 'Staff & permissions',
    eyebrow: '7 people · 2 admins · 1 instructor · 4 staff',
    description: 'Each person is scoped to a home site. Admins can cross sites.',
    action: 'Invite staff',
  },
  students: {
    title: 'Students',
    eyebrow: '84 students · 31 completed · 53 enrolled',
    description: 'Accounts, course enrollment, progress and certificates.',
    action: 'Manual enroll',
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
              'https://images.unsplash.com/photo-1453614512568-c4054b9be2c2?auto=format&fit=crop&w=240&q=70',
            ],
            [
              'Site 02 · Hội An',
              'Old town',
              '14 Phan Bội Châu, Minh An',
              '07:30–18:00',
              'Open',
              'https://images.unsplash.com/photo-1521017432531-fbd62d7a603f?auto=format&fit=crop&w=240&q=70',
            ],
            [
              'Site 03 · Da Nang',
              'An Thuận',
              '8 An Thuận 12, Ngũ Hành Sơn',
              'Opens 09.2026',
              'Opens Sep',
              'https://images.unsplash.com/photo-1559925395-82d087d0fe3c?auto=format&fit=crop&w=240&q=70',
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
            {kind === 'announcements' && (
              <div className="space-y-1">
                {ANNOUNCEMENTS.filter((item) => matches(item.join(' '))).map(
                  ([title, description, status, meta]) => (
                    <div key={title} className="border-b py-4 last:border-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{title}</p>
                        <Badge variant={statusVariant(status)}>{status}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                      <p className="text-muted-foreground mt-2 font-mono text-xs">{meta}</p>
                      <Button size="sm" variant="link" className="mt-2 px-0" onClick={action}>
                        Edit
                      </Button>
                    </div>
                  ),
                )}
              </div>
            )}
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
            {kind === 'staff' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Home site</TableHead>
                    <TableHead>Last seen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STAFF.filter((person) => matches(person.join(' '))).map(
                    ([initials, name, email, role, site, lastSeen, status]) => (
                      <TableRow key={email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="bg-secondary flex size-8 items-center justify-center rounded-full font-mono text-xs">
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium">{name}</p>
                              <p className="text-muted-foreground text-xs">{email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{role}</Badge>
                        </TableCell>
                        <TableCell>{site}</TableCell>
                        <TableCell className="font-mono text-xs">{lastSeen}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(String(status))}>{String(status)}</Badge>
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
            {kind === 'students' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STUDENTS.filter((student) => matches(student.join(' '))).map(
                    ([initials, name, email, course, progress, status]) => (
                      <TableRow key={email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="bg-secondary flex size-8 items-center justify-center rounded-full font-mono text-xs">
                              {initials}
                            </span>
                            <span className="font-medium">{name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{email}</TableCell>
                        <TableCell>{course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-secondary h-1.5 w-24 rounded-full">
                              <div
                                className="bg-primary h-1.5 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(String(status))}>{String(status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={action}>
                            Open
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
