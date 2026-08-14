'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { FormField } from '@/components/form/FormField';

export interface ControlledSelectOption {
  label: string;
  value: string;
}

export interface ControlledSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  options: ControlledSelectOption[];
  label?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ControlledSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  options,
  label,
  id,
  placeholder,
  disabled,
}: ControlledSelectProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField id={fieldId} label={label} error={fieldState.error?.message}>
          <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
            <SelectTrigger
              id={fieldId}
              className="w-full"
              aria-invalid={Boolean(fieldState.error)}
              aria-describedby={fieldState.error ? `${fieldId}-error` : undefined}
              onBlur={field.onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
};
