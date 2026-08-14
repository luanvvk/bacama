import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const QuantityStepper = ({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) => (
  <div className="border-input inline-flex items-center rounded-lg border">
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Decrease quantity"
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
    >
      <Minus />
    </Button>
    <span className="w-8 text-center font-mono text-sm font-semibold tabular-nums">{value}</span>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Increase quantity"
      disabled={value >= max}
      onClick={() => onChange(Math.min(max, value + 1))}
    >
      <Plus />
    </Button>
  </div>
);
