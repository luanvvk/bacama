import { z } from 'zod';

const required = (message: string) => z.string().trim().min(1, message);

// Strict: slug, timezone, opensAt, imageUrl and any other key are not editable here.
export const siteSchema = z.strictObject({
  nameVi: required('Enter the Vietnamese name.'),
  nameEn: required('Enter the English name.'),
  addressVi: required('Enter the Vietnamese address.'),
  addressEn: required('Enter the English address.'),
  hoursVi: required('Enter the Vietnamese hours.'),
  hoursEn: required('Enter the English hours.'),
  isActive: z.boolean(),
  todaysRoastProductId: z.string().min(1).nullable(),
});

export type SiteValues = z.output<typeof siteSchema>;
