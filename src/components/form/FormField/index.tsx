import { type ReactNode } from 'react';

import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export const FormField = ({ id, label, error, className, children }: FormFieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && <Label htmlFor={id}>{label}</Label>}
    {children}
    {error && (
      <p id={`${id}-error`} className="text-destructive text-sm">
        {error}
      </p>
    )}
  </div>
);
