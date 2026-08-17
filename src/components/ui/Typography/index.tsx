import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('font-heading text-foreground leading-tight tracking-tight', {
  variants: {
    size: {
      xl: 'text-5xl',
      lg: 'text-4xl',
      md: 'text-3xl',
      sm: 'text-xl',
      xs: 'text-lg',
    },
    weight: {
      normal: 'font-normal',
      semibold: 'font-semibold',
    },
  },
  defaultVariants: { size: 'md', weight: 'normal' },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Comp = 'h2', size, weight, className, ...props }, ref) => (
    <Comp ref={ref} className={cn(headingVariants({ size, weight }), className)} {...props} />
  ),
);

Heading.displayName = 'Heading';

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base leading-relaxed',
      lead: 'text-lg leading-relaxed',
      small: 'text-sm leading-normal',
      muted: 'text-sm leading-normal text-muted-foreground',
      eyebrow: 'font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase',
    },
  },
  defaultVariants: { variant: 'body' },
});

export interface TextProps
  extends HTMLAttributes<HTMLParagraphElement>, VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ as: Comp = 'p', variant, className, ...props }, ref) => (
    <Comp ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
  ),
);

Text.displayName = 'Text';
