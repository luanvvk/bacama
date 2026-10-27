import { type ReactNode } from 'react';

import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export const FormField = ({ id, label, error, required, className, children }: FormFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
    )}
    {children}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-destructive text-sm">
        {error}
      </p>
    )}
  </div>
);
