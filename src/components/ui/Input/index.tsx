import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.ComponentProps<'input'>;

const Input = ({ className, type, ...props }: InputProps) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      'border-input bg-background file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive h-8 w-full min-w-0 rounded-lg border px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      className,
    )}
    {...props}
  />
);

export { Input };
