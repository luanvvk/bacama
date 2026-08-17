import { cn } from '@/lib/utils';

export interface OrderTrackerStep {
  label: string;
  detail: string;
  done: boolean;
}

export interface OrderTrackerProps {
  steps: OrderTrackerStep[];
}

export const OrderTracker = ({ steps }: OrderTrackerProps) => (
  <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
    {steps.map((step) => (
      <li
        key={step.label}
        className={cn('border-t-2 pt-3', step.done ? 'border-primary' : 'border-border')}
      >
        <p className={cn('text-sm font-medium', !step.done && 'text-muted-foreground')}>
          {step.label}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{step.detail}</p>
      </li>
    ))}
  </ol>
);
