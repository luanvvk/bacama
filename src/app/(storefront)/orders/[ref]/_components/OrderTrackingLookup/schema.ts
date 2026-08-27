import { z } from 'zod';

export interface TrackOrderValidationMessages {
  phone: string;
}

export const buildTrackOrderSchema = (messages: TrackOrderValidationMessages) =>
  z.object({
    phone: z.string().min(8, messages.phone),
  });

export type TrackOrderFormValues = z.infer<ReturnType<typeof buildTrackOrderSchema>>;
