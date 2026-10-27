'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledCheckbox } from '@/components/form/ControlledCheckbox';
import { ControlledInput } from '@/components/form/ControlledInput';
import { ControlledSelect } from '@/components/form/ControlledSelect';
import { Button } from '@/components/ui/Button';
import { siteSchema } from '@/lib/schemas/site';
import { toast } from '@/lib/toast';
import type { AdminSite, RoastProductOption } from '@/services/sites/site-admin';

// Radix Select cannot hold an empty value, so "no roast" is a sentinel mapped to null on submit.
const NO_ROAST = 'none';

const formSchema = siteSchema.extend({ todaysRoastProductId: z.string() });
type SiteFormValues = z.infer<typeof formSchema>;

interface SiteEditorProps {
  site: AdminSite;
  products: RoastProductOption[];
}

export const SiteEditor = ({ site, products }: SiteEditorProps) => {
  const t = useTranslations('Admin.sites');
  const router = useRouter();
  const { control, handleSubmit, formState } = useForm<SiteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameVi: site.nameVi,
      nameEn: site.nameEn,
      addressVi: site.addressVi,
      addressEn: site.addressEn,
      hoursVi: site.hoursVi,
      hoursEn: site.hoursEn,
      isActive: site.isActive,
      todaysRoastProductId: site.todaysRoastProductId ?? NO_ROAST,
    },
  });

  const onSubmit = async (values: SiteFormValues) => {
    try {
      const response = await fetch(`/api/admin/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          todaysRoastProductId:
            values.todaysRoastProductId === NO_ROAST ? null : values.todaysRoastProductId,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      toast.success(t('saved'));
      router.push('/admin/sites');
      router.refresh();
    } catch {
      toast.error(t('saveFailed'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <ControlledInput control={control} name="nameVi" label={t('nameVi')} />
      <ControlledInput control={control} name="nameEn" label={t('nameEn')} />
      <ControlledInput control={control} name="addressVi" label={t('addressVi')} />
      <ControlledInput control={control} name="addressEn" label={t('addressEn')} />
      <ControlledInput control={control} name="hoursVi" label={t('hoursVi')} />
      <ControlledInput control={control} name="hoursEn" label={t('hoursEn')} />
      <div className="sm:col-span-2">
        <ControlledSelect
          control={control}
          name="todaysRoastProductId"
          label={t('todaysRoast')}
          options={[
            { label: t('noRoast'), value: NO_ROAST },
            ...products.map((product) => ({ label: product.name, value: product.id })),
          ]}
        />
      </div>
      <div className="sm:col-span-2">
        <ControlledCheckbox control={control} name="isActive" label={t('active')} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {t('save')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/sites')}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
