'use client';

import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';
import { FormField } from '@/components/form/FormField';

export interface ControlledRadioGroupOption {
  value: string;
  label: string;
  description?: string;
  meta?: string;
}

export interface ControlledRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  options: ControlledRadioGroupOption[];
  label?: string;
  id?: string;
  disabled?: boolean;
}

export const ControlledRadioGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  options,
  label,
  id,
  disabled,
}: ControlledRadioGroupProps<TFieldValues, TName>) => {
  const fieldId = id ?? name;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField id={fieldId} label={label} error={fieldState.error?.message}>
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
            aria-invalid={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${fieldId}-error` : undefined}
          >
            {options.map((option) => {
              const optionId = `${fieldId}-${option.value}`;
              const isSelected = field.value === option.value;

              return (
                <Label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal',
                    isSelected && 'border-primary bg-primary/5',
                    disabled && 'cursor-not-allowed',
                  )}
                >
                  <RadioGroupItem value={option.value} id={optionId} className="mt-0.5" />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.meta && (
                        <span className="text-muted-foreground font-mono text-xs uppercase">
                          {option.meta}
                        </span>
                      )}
                    </span>
                    {option.description && (
                      <span className="text-muted-foreground text-xs">{option.description}</span>
                    )}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </FormField>
      )}
    />
  );
};
