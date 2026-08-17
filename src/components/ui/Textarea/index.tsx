import * as React from 'react';

import { cn } from '@/lib/utils';

export type TextareaProps = React.ComponentProps<'textarea'>;

const Textarea = ({ className, ...props }: TextareaProps) => (
  <textarea
    data-slot="textarea"
    className={cn(
      'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg border px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      className,
    )}
    {...props}
  />
);

export { Textarea };
