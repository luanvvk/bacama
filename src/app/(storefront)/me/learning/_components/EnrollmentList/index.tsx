import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Typography';
import { getContinueHref } from '@/services/enrollments/get-continue-href';
import type { UserEnrollment } from '@/services/enrollments/get-user-enrollments';

interface EnrollmentListProps {
  enrollments: UserEnrollment[];
}

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

export const EnrollmentList = ({ enrollments }: EnrollmentListProps) => {
  const t = useTranslations('MeLearning');
  const format = useFormatter();

  if (enrollments.length === 0) {
    return (
      <div className="mt-8">
        <Text className="text-muted-foreground">{t('empty')}</Text>
        <Button asChild size="lg" className="mt-4">
          <Link href="/courses">{t('browseCourses')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
      {enrollments.map((enrollment) => (
        <li key={enrollment.id} className="flex flex-col gap-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Text className="font-medium">{enrollment.course.name}</Text>
              {enrollment.sessionStartsAt && (
                <Text className="text-muted-foreground text-sm">
                  {format.dateTime(enrollment.sessionStartsAt, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: TIME_ZONE,
                  })}
                  {enrollment.siteName ? ` · ${enrollment.siteName}` : ''}
                </Text>
              )}
            </div>
            {enrollment.status === 'completed' && <Badge variant="success">{t('completed')}</Badge>}
          </div>

          {enrollment.status === 'pending' && enrollment.holdExpiresAt && (
            <Text className="text-muted-foreground text-sm">
              {t('seatHeldUntil', {
                time: format.dateTime(enrollment.holdExpiresAt, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: TIME_ZONE,
                }),
              })}
            </Text>
          )}

          {enrollment.status === 'active' && (
            <>
              {enrollment.progressPercent !== null && (
                <div
                  role="progressbar"
                  aria-label={t('progressLabel', { name: enrollment.course.name })}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={enrollment.progressPercent}
                  className="bg-muted h-2 w-full overflow-hidden rounded-full"
                >
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${enrollment.progressPercent}%` }}
                  />
                </div>
              )}
              <div>
                <Button asChild size="sm">
                  <Link href={getContinueHref(enrollment)}>{t('continue')}</Link>
                </Button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};
