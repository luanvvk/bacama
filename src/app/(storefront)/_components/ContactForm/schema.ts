import { z } from 'zod';

export interface ContactValidationMessages {
  name: string;
  email: string;
  message: string;
}

export const buildContactSchema = (messages: ContactValidationMessages) =>
  z.object({
    name: z.string().min(2, messages.name),
    email: z.string().email(messages.email),
    message: z.string().min(10, messages.message),
  });

export type ContactFormValues = z.infer<ReturnType<typeof buildContactSchema>>;
