import { cn } from '@/lib/utils';

export interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { step: 1, label: 'Choose payment' },
  { step: 2, label: 'Confirm' },
  { step: 3, label: 'Done' },
] as const;

export const CheckoutSteps = ({ currentStep }: CheckoutStepsProps) => (
  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs tracking-widest uppercase">
    {STEPS.map(({ step, label }, index) => {
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
            {String(step).padStart(2, '0')} · {label}
            {isDone && ' ✓'}
          </span>
          {index < STEPS.length - 1 && (
            <span className="text-border" aria-hidden="true">
              &mdash;
            </span>
          )}
        </li>
      );
    })}
  </ol>
);
