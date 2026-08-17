import { z } from 'zod';

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['zalopay', 'momo', 'vnpay', 'bank', 'card', 'cod']),
  fullName: z.string().min(1, 'Enter your full name'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  address: z.string().min(1, 'Enter your delivery address'),
  province: z.string().min(1, 'Choose a province or city'),
  deliveryOption: z.string().min(1, 'Choose how to receive your order'),
  note: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
