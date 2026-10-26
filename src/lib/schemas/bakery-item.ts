import { z } from 'zod';

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const required = (message: string) => z.string().trim().min(1, message);

export const BAKERY_HANDOFFS = ['pickup', 'grabfood', 'courier'] as const;

export const bakeryItemSchema = z.object({
  siteId: required('Choose a site.'),
  nameVi: required('Enter the Vietnamese name.'),
  nameEn: required('Enter the English name.'),
  descriptionVi: required('Enter the Vietnamese description.'),
  descriptionEn: required('Enter the English description.'),
  priceVnd: z.coerce
    .number<unknown>('Enter a price.')
    .int('Price must be a whole number of VND.')
    .min(0, 'Price cannot be negative.'),
  bakesAt: required('Enter when it bakes.'),
  sellOutBy: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  handoff: z.enum(BAKERY_HANDOFFS),
  handoffUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isHttpsUrl(value), 'Link must start with https://')
    .optional()
    .transform((value) => value || null),
  isActive: z.boolean(),
});

export type BakeryItemFormInput = z.input<typeof bakeryItemSchema>;
export type BakeryItemValues = z.output<typeof bakeryItemSchema>;
