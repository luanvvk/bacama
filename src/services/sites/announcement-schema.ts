import { z } from 'zod';

const title = z.string().trim().min(1).max(160);
const body = z.string().trim().min(1).max(2000);
const instant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

export const announcementSchema = z
  .object({
    siteId: z.string().min(1).nullable(),
    titleVi: title,
    titleEn: title,
    bodyVi: body,
    bodyEn: body,
    startsAt: instant,
    endsAt: instant.optional(),
    isActive: z.boolean(),
  })
  .strict()
  .refine((value) => !value.endsAt || value.endsAt > value.startsAt, { path: ['endsAt'] });

export type AnnouncementInput = z.infer<typeof announcementSchema>;
