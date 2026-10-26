import { z } from 'zod';

import { endOfHcmDay, startOfHcmDay } from '@/lib/hcm-date';
import { prisma } from '@/lib/prisma';

const calendarDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => !Number.isNaN(startOfHcmDay(value).getTime()));

const nonNegativeInt = z.number().int().min(0);

export const updateProductSchema = z
  .strictObject({
    priceVnd: nonNegativeInt,
    stock: nonNegativeInt,
    reorderLevel: nonNegativeInt,
    roastDate: calendarDate.nullable(),
    featuredUntil: calendarDate.nullable(),
    isActive: z.boolean(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

const NOT_FOUND_CODE = 'P2025';

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  const { roastDate, featuredUntil, ...rest } = updateProductSchema.parse(input);

  try {
    return await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(roastDate !== undefined && {
          roastDate: roastDate === null ? null : startOfHcmDay(roastDate),
        }),
        ...(featuredUntil !== undefined && {
          featuredUntil: featuredUntil === null ? null : endOfHcmDay(featuredUntil),
        }),
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    if ((error as { code?: string }).code === NOT_FOUND_CODE) return null;
    throw error;
  }
};
