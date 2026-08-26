'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

export interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}

const STEP_KEYS = [
  { step: 1, key: 'choosePayment' },
  { step: 2, key: 'confirm' },
  { step: 3, key: 'done' },
] as const;

export const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => {
  const t = useTranslations('CheckoutSteps');

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs tracking-widest uppercase">
      {STEP_KEYS.map(({ step, key }, index) => {
        const isDone = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                'text-muted-foreground',
                isDone && 'text-success',
                isCurrent && 'text-foreground font-semibold',
              )}
            >
              {String(step).padStart(2, '0')} · {t(key)}
              {isDone && ' ✓'}
            </span>
            {index < STEP_KEYS.length - 1 && (
              <span className="text-border" aria-hidden="true">
                &mdash;
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
};
