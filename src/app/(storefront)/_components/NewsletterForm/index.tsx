'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';

import { ControlledInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

import { buildNewsletterSchema, type NewsletterFormValues } from './schema';

export const NewsletterForm = () => {
  const t = useTranslations('NewsletterForm');
  const locale = useLocale();

  const { control, handleSubmit, reset } = useForm<NewsletterFormValues>({
    resolver: zodResolver(buildNewsletterSchema({ email: t('emailValidation') })),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: NewsletterFormValues) => {
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });

      if (res.status === 429) {
        toast(t('rateLimitedToast'));
        return;
      }

      if (!res.ok) {
        toast(t('errorToast'));
        return;
      }

      reset();
      toast(t('successToast'));
    } catch {
      toast(t('errorToast'));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <ControlledInput
        control={control}
        name="email"
        label={t('emailLabel')}
        placeholder="you@example.com"
        type="email"
        className="sm:min-w-72"
      />
      <Button type="submit" className="sm:mt-7">
        {t('subscribe')}
      </Button>
    </form>
  );
};
