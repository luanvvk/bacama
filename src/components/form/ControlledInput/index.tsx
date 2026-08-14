'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { Input, type InputProps } from '@/components/ui/Input';
import { FormField } from '@/components/form/FormField';

export interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'name' | 'defaultValue' | 'id'> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  id?: string;
}

export const ControlledInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  id,
  ...props
}: ControlledInputProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField id={fieldId} label={label} error={fieldState.error?.message}>
          <Input
            {...field}
            {...props}
            id={fieldId}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${fieldId}-error` : undefined}
          />
        </FormField>
      )}
    />
  );
};
