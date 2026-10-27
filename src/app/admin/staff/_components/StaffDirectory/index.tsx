'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import { toast } from '@/lib/toast';
import type { AdminStaffMember } from '@/services/users/get-admin-staff';

export interface StaffDirectoryProps {
  staff: AdminStaffMember[];
  nextCursor: string | null;
}

export const StaffDirectory = ({
  staff: initialStaff,
  nextCursor: initialCursor,
}: StaffDirectoryProps) => {
  const t = useTranslations('Admin.staff');
  const [staff, setStaff] = useState(initialStaff);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const loadMore = async () => {
    if (!nextCursor) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/staff?cursor=${encodeURIComponent(nextCursor)}`);
      if (!response.ok) throw new Error(String(response.status));
      const page: { items: AdminStaffMember[]; nextCursor: string | null } = await response.json();
      setStaff((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      toast.error(t('loadMoreFailed'));
    } finally {
      setLoading(false);
    }
  };

  const needle = query.trim().toLowerCase();
  const visible = staff.filter((person) =>
    `${person.name} ${person.email} ${person.role} ${person.homeSiteName ?? ''}`
      .toLowerCase()
      .includes(needle),
  );
  const admins = staff.filter((person) => person.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          {t('eyebrow', { count: staff.length, admins })}
        </p>
        <Heading as="h1" size="lg" className="mt-2">
          {t('title')}
        </Heading>
        <Text variant="muted" className="mt-1">
          {t('description')}
        </Text>
        <Text variant="muted" className="mt-1">
          {t('rolesNote')}
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
                  <TableHead>{t('columns.role')}</TableHead>
                  <TableHead>{t('columns.homeSite')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-muted-foreground text-xs">{person.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t(`roles.${person.role}`)}</Badge>
                    </TableCell>
                    <TableCell>{person.homeSiteName ?? t('noSite')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 min-w-32"
                onClick={loadMore}
                disabled={loading}
              >
                {t('loadMore')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
