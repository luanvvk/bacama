'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const ratingVariants = cva('inline-flex items-center gap-0.5', {
  variants: {
    size: {
      sm: '[&_svg]:size-3.5',
      md: '[&_svg]:size-4',
      lg: '[&_svg]:size-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface RatingProps extends VariantProps<typeof ratingVariants> {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const starClassName = (filled: boolean) =>
  cn('transition-colors', filled ? 'fill-primary text-primary' : 'fill-none text-muted-foreground');

export const Rating = ({ value, max = 5, onChange, size, className }: RatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!onChange) {
    return (
      <div
        role="img"
        aria-label={`Rated ${value} out of ${max} stars`}
        className={cn(ratingVariants({ size }), className)}
      >
        {Array.from({ length: max }, (_, index) => (
          <Star key={index} className={starClassName(index < value)} />
        ))}
      </div>
    );
  }

  const displayValue = hovered ?? value;

  return (
    <div
      role="group"
      aria-label={`Rating: ${value} out of ${max} stars`}
      className={cn(ratingVariants({ size }), className)}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            aria-pressed={value === starValue}
            className="focus-visible:outline-ring rounded-xs outline-none focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
            onMouseEnter={() => setHovered(starValue)}
            onFocus={() => setHovered(starValue)}
            onBlur={() => setHovered(null)}
            onClick={() => onChange(starValue)}
          >
            <Star className={starClassName(starValue <= displayValue)} />
          </button>
        );
      })}
    </div>
  );
};
