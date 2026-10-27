import { z } from 'zod';

import { MENU_SECTIONS } from '@/constants/menu';

const name = z.string().trim().min(1).max(120);
const priceVnd = z.number().int().positive().max(100_000_000);
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine((value) => value.startsWith('https://'));
const description = z.string().trim().max(160);
const order = z.number().int().min(0).max(100_000);

export const createMenuItemSchema = z
  .object({
    siteId: z.string().min(1),
    section: z.enum(MENU_SECTIONS),
    nameVi: name,
    nameEn: name,
    priceVnd,
    imageUrl: imageUrl.nullish(),
    descriptionVi: description.nullish(),
    descriptionEn: description.nullish(),
    order: order.default(0),
  })
  .strict();

export const updateMenuItemSchema = z
  .object({
    section: z.enum(MENU_SECTIONS),
    nameVi: name,
    nameEn: name,
    priceVnd,
    imageUrl: imageUrl.nullable(),
    descriptionVi: description.nullable(),
    descriptionEn: description.nullable(),
    order,
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0);

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
