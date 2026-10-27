'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Heading, Text } from '@/components/ui/Typography';
import type { AdminStudent } from '@/services/enrollments/get-admin-students';

export interface StudentsDirectoryProps {
  students: AdminStudent[];
  /** All enrolments, before the row cap. */
  total: number;
}

const STATUS_VARIANT = {
  active: 'success',
  completed: 'success',
  pending: 'warning',
  cancelled: 'outline',
} as const satisfies Record<AdminStudent['status'], 'success' | 'warning' | 'outline'>;

export const StudentsDirectory = ({ students, total }: StudentsDirectoryProps) => {
  const t = useTranslations('Admin.students');
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = students.filter((student) =>
    `${student.name} ${student.email} ${student.courseTitle}`.toLowerCase().includes(needle),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {t('eyebrow', { count: total })}
        </p>
        <Heading as="h1" size="lg" className="mt-2">
          {t('title')}
        </Heading>
        <Text variant="muted" className="mt-1">
          {t('description')}
        </Text>
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
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchLabel')}
              className="pl-9"
            />
          </div>
          {visible.length === 0 ? (
            <Text variant="muted">{t('empty')}</Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columns.name')}</TableHead>
                  <TableHead>{t('columns.email')}</TableHead>
                  <TableHead>{t('columns.course')}</TableHead>
                  <TableHead>{t('columns.progress')}</TableHead>
                  <TableHead>{t('columns.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((student) => (
                  <TableRow key={student.enrollmentId}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.courseTitle}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="bg-secondary h-1.5 w-24 rounded-full">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${student.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{student.progressPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[student.status]}>
                        {t(`status.${student.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {total > students.length && (
            <Text variant="muted">{t('truncated', { shown: students.length })}</Text>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
