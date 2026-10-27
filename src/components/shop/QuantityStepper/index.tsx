import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  name?: string;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  name,
}: QuantityStepperProps) => {
  const t = useTranslations('QuantityStepper');

  return (
    <div className="border-input inline-flex items-center rounded-lg border">
      <Button
        type="button"
        variant="ghost"
        size="touch-icon-sm"
        aria-label={name ? t('decreaseNamed', { name }) : t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus />
      </Button>
      <span
        aria-live="polite"
        className="w-8 text-center font-mono text-sm font-semibold tabular-nums"
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="touch-icon-sm"
        aria-label={name ? t('increaseNamed', { name }) : t('increase')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus />
      </Button>
    </div>
  );
};
