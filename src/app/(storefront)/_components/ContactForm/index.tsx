'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { ControlledInput, ControlledTextarea } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

import { buildContactSchema, type ContactFormValues } from './schema';

export const ContactForm = () => {
  const t = useTranslations('ContactForm');

  const { control, handleSubmit, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(
      buildContactSchema({
        name: t('nameValidation'),
        email: t('emailValidation'),
        message: t('messageValidation'),
      }),
    ),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = () => {
    reset();
    toast(t('successToast'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ControlledInput control={control} name="name" label={t('nameLabel')} />
      <ControlledInput control={control} name="email" label={t('emailLabel')} type="email" />
      <ControlledTextarea
        control={control}
        name="message"
        label={t('messageLabel')}
        placeholder={t('messagePlaceholder')}
      />
      <Button type="submit">{t('submit')}</Button>
    </form>
  );
};
