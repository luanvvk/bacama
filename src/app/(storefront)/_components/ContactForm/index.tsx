'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ControlledInput, ControlledTextarea } from '@/components/form';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  email: z.string().email('Enter a valid email address.'),
  message: z.string().min(10, 'Tell us a little more so we can help.'),
});
type ContactValues = z.infer<typeof contactSchema>;

export const ContactForm = () => {
  const { control, handleSubmit, reset } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = () => {
    reset();
    toast('Message received. We will reply during opening hours.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ControlledInput control={control} name="name" label="Your name" />
      <ControlledInput control={control} name="email" label="Email address" type="email" />
      <ControlledTextarea
        control={control}
        name="message"
        label="Message"
        placeholder="What can we help with?"
      />
      <Button type="submit">Send message</Button>
    </form>
  );
};
