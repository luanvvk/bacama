'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Textarea, type TextareaProps } from '@/components/ui/Textarea';
import { FormField } from '@/components/form/FormField';

export interface ControlledTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<TextareaProps, 'name' | 'defaultValue' | 'id'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  id?: string;
}

export const ControlledTextarea = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  id,
  required,
  ...props
}: ControlledTextareaProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField id={fieldId} label={label} error={fieldState.error?.message} required={required}>
          <Textarea
            {...field}
            {...props}
            id={fieldId}
            aria-required={required || undefined}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${fieldId}-error` : undefined}
          />
        </FormField>
      )}
    />
  );
};
