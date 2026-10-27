'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledCheckbox, ControlledInput, ControlledSelect } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { MENU_SECTIONS } from '@/constants/menu';
import { toast } from '@/lib/toast';
import type { AdminMenuItem } from '@/services/catalog/get-admin-menu-items';

export interface MenuItemFormProps {
  item?: AdminMenuItem;
  siteOptions?: { value: string; label: string }[];
  defaultSiteId: string;
  onDone: () => void;
}

const buildSchema = (t: (key: string) => string) =>
  z.object({
    siteId: z.string().min(1, t('validation.required')),
    section: z.enum(MENU_SECTIONS, t('validation.required')),
    nameVi: z.string().trim().min(1, t('validation.required')).max(120, t('validation.maxLength')),
    nameEn: z.string().trim().min(1, t('validation.required')).max(120, t('validation.maxLength')),
    priceVnd: z.string().regex(/^[1-9]\d*$/, t('validation.price')),
    imageUrl: z
      .string()
      .trim()
      .max(500, t('validation.maxUrl'))
      .refine((value) => value === '' || /^https:\/\/\S+$/.test(value), t('validation.https')),
    descriptionVi: z.string().trim().max(160, t('validation.maxDescription')),
    descriptionEn: z.string().trim().max(160, t('validation.maxDescription')),
    order: z.string().regex(/^\d+$/, t('validation.order')),
    isActive: z.boolean(),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export const MenuItemForm = ({ item, siteOptions, defaultSiteId, onDone }: MenuItemFormProps) => {
  const t = useTranslations('Admin.menu');
  const tSections = useTranslations('Menu.sections');
  const router = useRouter();
  const schema = useMemo(() => buildSchema(t), [t]);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteId: item?.siteId ?? defaultSiteId,
      section: item?.section as FormValues['section'] | undefined,
      nameVi: item?.nameVi ?? '',
      nameEn: item?.nameEn ?? '',
      priceVnd: item ? String(item.priceVnd) : '',
      imageUrl: item?.imageUrl ?? '',
      descriptionVi: item?.descriptionVi ?? '',
      descriptionEn: item?.descriptionEn ?? '',
      order: item ? String(item.order) : '0',
      isActive: item?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const common = {
      section: values.section,
      nameVi: values.nameVi,
      nameEn: values.nameEn,
      priceVnd: Number(values.priceVnd),
      imageUrl: values.imageUrl || null,
      descriptionVi: values.descriptionVi || null,
      descriptionEn: values.descriptionEn || null,
      order: Number(values.order),
    };
    const response = await fetch(
      item ? `/api/admin/menu-items/${item.id}` : '/api/admin/menu-items',
      {
        method: item ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          item ? { ...common, isActive: values.isActive } : { ...common, siteId: values.siteId },
        ),
      },
    );

    if (!response.ok) {
      toast.error(
        response.status === 403
          ? t('forbidden')
          : response.status === 409
            ? t('duplicate')
            : t('saveFailed'),
      );
      return;
    }

    toast.success(t('saved'));
    router.refresh();
    onDone();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {!item && siteOptions && (
        <ControlledSelect
          control={control}
          name="siteId"
          label={t('fields.siteId')}
          options={siteOptions}
        />
      )}
      <ControlledSelect
        control={control}
        name="section"
        label={t('fields.section')}
        options={MENU_SECTIONS.map((section) => ({ value: section, label: tSections(section) }))}
      />
      <ControlledInput control={control} name="nameVi" label={t('fields.nameVi')} />
      <ControlledInput control={control} name="nameEn" label={t('fields.nameEn')} />
      <ControlledInput
        control={control}
        name="priceVnd"
        label={t('fields.priceVnd')}
        inputMode="numeric"
      />
      <ControlledInput control={control} name="imageUrl" label={t('fields.imageUrl')} />
      <ControlledInput control={control} name="descriptionVi" label={t('fields.descriptionVi')} />
      <ControlledInput control={control} name="descriptionEn" label={t('fields.descriptionEn')} />
      <ControlledInput
        control={control}
        name="order"
        label={t('fields.order')}
        inputMode="numeric"
      />
      {item && (
        <ControlledCheckbox control={control} name="isActive" label={t('fields.isActive')} />
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
};
