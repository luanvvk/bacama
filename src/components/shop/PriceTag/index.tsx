import { formatUsdApprox, formatVnd } from '@/lib/format-price';
import { cn } from '@/lib/utils';

export interface PriceTagProps {
  priceVnd: number;
  className?: string;
}

export const PriceTag = ({ priceVnd, className }: PriceTagProps) => (
  <span className={cn('font-mono font-bold tabular-nums', className)}>
    {formatVnd(priceVnd)}
    <span className="text-muted-foreground ml-1.5 text-xs font-normal">
      · {formatUsdApprox(priceVnd)}
    </span>
  </span>
);
