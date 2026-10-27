'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm, type Control } from 'react-hook-form';

import { ControlledCheckbox } from '@/components/form/ControlledCheckbox';
import { ControlledInput } from '@/components/form/ControlledInput';
import { ControlledSelect } from '@/components/form/ControlledSelect';
import { ControlledTextarea } from '@/components/form/ControlledTextarea';
import { Button } from '@/components/ui/Button';
import {
  BAKERY_HANDOFFS,
  bakeryItemSchema,
  type BakeryItemFormInput,
  type BakeryItemValues,
} from '@/lib/schemas/bakery-item';

export interface BakerySiteOption {
  id: string;
  name: string;
}

interface BakeryItemFormProps {
  defaultValues: BakeryItemFormInput;
  sites: BakerySiteOption[];
  /** Staff are pinned to their home site; an existing item never changes site. */
  siteLocked: boolean;
  submitLabel: string;
  onSubmit: (values: BakeryItemValues) => Promise<void>;
  onCancel: () => void;
}

export const BakeryItemForm = ({
  defaultValues,
  sites,
  siteLocked,
  submitLabel,
  onSubmit,
  onCancel,
}: BakeryItemFormProps) => {
  const t = useTranslations('Admin.bakery');
  const form = useForm<BakeryItemFormInput, unknown, BakeryItemValues>({
    resolver: zodResolver(bakeryItemSchema),
    defaultValues,
  });
  const { handleSubmit, formState } = form;
  // The Controlled* inputs are typed against the form input shape; the resolver only adds the output type.
  const control = form.control as unknown as Control<BakeryItemFormInput>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <div className="sm:col-span-2">
        <ControlledSelect
          control={control}
          name="siteId"
          label={t('site')}
          options={sites.map((site) => ({ label: site.name, value: site.id }))}
          disabled={siteLocked}
        />
      </div>
      <ControlledInput control={control} name="nameVi" label={t('nameVi')} />
      <ControlledInput control={control} name="nameEn" label={t('nameEn')} />
      <ControlledTextarea control={control} name="descriptionVi" label={t('descriptionVi')} />
      <ControlledTextarea control={control} name="descriptionEn" label={t('descriptionEn')} />
      <ControlledInput
        control={control}
        name="priceVnd"
        label={t('price')}
        type="number"
        inputMode="numeric"
      />
      <ControlledInput control={control} name="bakesAt" label={t('bakesAt')} />
      <ControlledInput control={control} name="sellOutBy" label={t('sellOutBy')} />
      <ControlledSelect
        control={control}
        name="handoff"
        label={t('handoff')}
        options={BAKERY_HANDOFFS.map((value) => ({ label: t(`handoff_${value}`), value }))}
      />
      <div className="sm:col-span-2">
        <ControlledInput
          control={control}
          name="handoffUrl"
          label={t('handoffUrl')}
          type="url"
          placeholder="https://"
        />
      </div>
      <div className="sm:col-span-2">
        <ControlledCheckbox control={control} name="isActive" label={t('active')} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
