'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  ControlledCheckbox,
  ControlledInput,
  ControlledSelect,
  ControlledTextarea,
} from '@/components/form';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';
import { toVietnamIso, toVietnamLocalInput } from '@/lib/vn-datetime';
import type { AdminAnnouncement } from '@/services/sites/get-admin-announcements';

export const ALL_SITES = 'all';

export interface AnnouncementFormProps {
  announcement?: AdminAnnouncement;
  /** Present only for admin, who may pick any site or all sites. */
  siteOptions?: { value: string; label: string }[];
  defaultSiteId: string;
  onDone: () => void;
}

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      siteId: z.string().min(1, t('validation.required')),
      titleVi: z
        .string()
        .trim()
        .min(1, t('validation.required'))
        .max(160, t('validation.titleMax')),
      titleEn: z
        .string()
        .trim()
        .min(1, t('validation.required'))
        .max(160, t('validation.titleMax')),
      bodyVi: z.string().trim().min(1, t('validation.required')).max(2000, t('validation.bodyMax')),
      bodyEn: z.string().trim().min(1, t('validation.required')).max(2000, t('validation.bodyMax')),
      startsAt: z.string().min(1, t('validation.required')),
      endsAt: z.string(),
      isActive: z.boolean(),
    })
    .refine((value) => !value.endsAt || value.endsAt > value.startsAt, {
      path: ['endsAt'],
      message: t('validation.endsAfterStart'),
    });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export const AnnouncementForm = ({
  announcement,
  siteOptions,
  defaultSiteId,
  onDone,
}: AnnouncementFormProps) => {
  const t = useTranslations('Admin.announcements');
  const router = useRouter();
  const schema = useMemo(() => buildSchema(t), [t]);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteId: announcement ? (announcement.siteId ?? ALL_SITES) : defaultSiteId,
      titleVi: announcement?.titleVi ?? '',
      titleEn: announcement?.titleEn ?? '',
      bodyVi: announcement?.bodyVi ?? '',
      bodyEn: announcement?.bodyEn ?? '',
      startsAt: announcement ? toVietnamLocalInput(announcement.startsAt) : '',
      endsAt: announcement?.endsAt ? toVietnamLocalInput(announcement.endsAt) : '',
      isActive: announcement?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch(
      announcement ? `/api/admin/announcements/${announcement.id}` : '/api/admin/announcements',
      {
        method: announcement ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: values.siteId === ALL_SITES ? null : values.siteId,
          titleVi: values.titleVi,
          titleEn: values.titleEn,
          bodyVi: values.bodyVi,
          bodyEn: values.bodyEn,
          startsAt: toVietnamIso(values.startsAt),
          ...(values.endsAt && { endsAt: toVietnamIso(values.endsAt) }),
          isActive: values.isActive,
        }),
      },
    );

    if (!response.ok) {
      toast.error(
        response.status === 403
          ? t('forbidden')
          : response.status === 404
            ? t('notFound')
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
      {siteOptions && (
        <ControlledSelect
          control={control}
          name="siteId"
          label={t('fields.siteId')}
          options={siteOptions}
        />
      )}
      <ControlledInput control={control} name="titleVi" label={t('fields.titleVi')} />
      <ControlledInput control={control} name="titleEn" label={t('fields.titleEn')} />
      <ControlledTextarea control={control} name="bodyVi" label={t('fields.bodyVi')} />
      <ControlledTextarea control={control} name="bodyEn" label={t('fields.bodyEn')} />
      <ControlledInput
        control={control}
        name="startsAt"
        type="datetime-local"
        label={t('fields.startsAt')}
      />
      <ControlledInput
        control={control}
        name="endsAt"
        type="datetime-local"
        label={t('fields.endsAt')}
      />
      <ControlledCheckbox control={control} name="isActive" label={t('fields.isActive')} />
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
