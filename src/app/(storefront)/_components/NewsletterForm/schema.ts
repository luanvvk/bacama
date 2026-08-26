import { z } from 'zod';

export interface NewsletterValidationMessages {
  email: string;
}

export const buildNewsletterSchema = (messages: NewsletterValidationMessages) =>
  z.object({ email: z.string().email(messages.email) });

export type NewsletterFormValues = z.infer<ReturnType<typeof buildNewsletterSchema>>;
