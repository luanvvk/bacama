'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

export interface ControlledCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  id?: string;
  disabled?: boolean;
}

export const ControlledCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  id,
  disabled,
}: ControlledCheckboxProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id={fieldId}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              aria-invalid={Boolean(fieldState.error)}
              aria-describedby={fieldState.error ? `${fieldId}-error` : undefined}
            />
            <Label htmlFor={fieldId}>{label}</Label>
          </div>
          {fieldState.error && (
            <p id={`${fieldId}-error`} className="text-destructive text-sm">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};
