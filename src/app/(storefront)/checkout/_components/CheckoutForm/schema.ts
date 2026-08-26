import { z } from 'zod';

export interface CheckoutValidationMessages {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  deliveryOption: string;
}

export const buildCheckoutSchema = (messages: CheckoutValidationMessages) =>
  z.object({
    paymentMethod: z.enum(['zalopay', 'momo', 'vnpay', 'bank', 'card', 'cod']),
    fullName: z.string().min(1, messages.fullName),
    phone: z.string().min(8, messages.phone),
    address: z.string().min(1, messages.address),
    province: z.string().min(1, messages.province),
    deliveryOption: z.string().min(1, messages.deliveryOption),
    note: z.string().optional(),
  });

export type CheckoutFormValues = z.infer<ReturnType<typeof buildCheckoutSchema>>;
