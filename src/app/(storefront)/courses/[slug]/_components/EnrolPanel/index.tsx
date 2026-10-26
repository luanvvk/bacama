'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Show } from '@clerk/nextjs';
import { useFormatter, useTranslations } from 'next-intl';

import { type CourseDetail } from '@/services/courses/map-course';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PriceTag } from '@/components/shop/PriceTag';

export interface EnrolPanelProps {
  course: CourseDetail;
}

type EnrolOutcome =
  | { kind: 'held'; holdExpiresAt: string }
  | { kind: 'active' | 'pending' | 'already-enrolled' | 'session-full' | 'failed' };

export const EnrolPanel = ({ course }: EnrolPanelProps) => {
  const t = useTranslations('CourseDetail');
  const format = useFormatter();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<EnrolOutcome>();

  const formatLabels: Record<CourseDetail['format'], string> = {
    online: t('formatOnline'),
    'in-person': t('formatInPerson'),
    hybrid: t('formatHybrid'),
  };
  const formatLabel = formatLabels[course.format];
  const ctaLabel = course.format === 'in-person' ? t('bookSeat') : t('enrol');
  const isSoldOut =
    course.seatLimited &&
    course.sessions.length > 0 &&
    course.sessions.every((session) => session.seatsLeft === 0);
  const needsSession = course.format !== 'online';

  const enrol = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, ...(needsSession && { sessionId }) }),
      });
      if (response.status === 409) {
        const { error } = await response.json();
        setOutcome({ kind: error === 'session_full' ? 'session-full' : 'already-enrolled' });
      } else if (response.ok) {
        const { status, holdExpiresAt } = await response.json();
        setOutcome(
          holdExpiresAt
            ? { kind: 'held', holdExpiresAt }
            : { kind: status === 'active' ? 'active' : 'pending' },
        );
      } else {
        setOutcome({ kind: 'failed' });
      }
      router.refresh();
    } catch {
      setOutcome({ kind: 'failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeMessage = (current: EnrolOutcome) => {
    switch (current.kind) {
      case 'held':
        return t('seatHeld', {
          time: format.dateTime(new Date(current.holdExpiresAt), {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Ho_Chi_Minh',
          }),
        });
      case 'active':
        return t('enrolled');
      case 'pending':
        return t('enrolPending');
      case 'already-enrolled':
        return t('alreadyEnrolled');
      case 'session-full':
        return t('sessionJustFilled');
      case 'failed':
        return t('enrolFailed');
    }
  };

  return (
    <div className="lg:sticky lg:top-24">
      <p className="text-primary font-mono text-xs tracking-widest uppercase">
        {course.meta ? `${formatLabel} · ${course.meta}` : formatLabel}
      </p>
      <h1 className="font-heading mt-2 text-3xl sm:text-4xl">{course.name}</h1>
      <p className="text-muted-foreground mt-3">{course.description}</p>

      {course.availability && (
        <Badge variant={course.seatLimited ? 'warning' : 'success'} className="mt-4 w-fit">
          {course.availability}
        </Badge>
      )}

      <div className="my-6 border-y py-4">
        <PriceTag priceVnd={course.priceVnd} className="text-3xl" />
      </div>

      <Show when="signed-out">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">{t('loginToEnrol')}</Link>
        </Button>
      </Show>
      <Show when="signed-in">
        {needsSession && course.sessions.length > 0 && (
          <fieldset className="mb-4 space-y-2">
            <legend className="mb-2 text-sm font-medium">{t('chooseSession')}</legend>
            {course.sessions.map((session) => (
              <label
                key={session.id}
                className="flex items-center gap-2 text-sm has-disabled:opacity-50"
              >
                <input
                  type="radio"
                  name="session"
                  value={session.id}
                  checked={sessionId === session.id}
                  disabled={session.seatsLeft === 0}
                  onChange={() => setSessionId(session.id)}
                />
                <span>
                  {session.startsAt} · {session.siteName}
                  {session.seatsLeft === 0 && ` · ${t('sessionFull')}`}
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isSoldOut || isSubmitting || (needsSession && !sessionId)}
          onClick={enrol}
        >
          {isSoldOut ? t('soldOut') : ctaLabel}
        </Button>
        {outcome && (
          <p role="status" className="mt-3 text-sm">
            {outcomeMessage(outcome)}
          </p>
        )}
      </Show>
    </div>
  );
};
