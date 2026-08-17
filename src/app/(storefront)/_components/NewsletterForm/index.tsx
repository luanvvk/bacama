'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledInput } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

const newsletterSchema = z.object({ email: z.string().email('Enter a valid email address.') });
type NewsletterValues = z.infer<typeof newsletterSchema>;

export const NewsletterForm = () => {
  const { control, handleSubmit, reset } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    reset();
    toast('You are on the list. Newsletter delivery will be connected soon.');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <ControlledInput
        control={control}
        name="email"
        label="Email address"
        placeholder="you@example.com"
        type="email"
        className="sm:min-w-72"
      />
      <Button type="submit" className="sm:mt-7">
        Subscribe
      </Button>
    </form>
  );
};
