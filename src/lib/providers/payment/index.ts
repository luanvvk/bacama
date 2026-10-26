import { codProvider } from './cod';
import type { PaymentMethodValue, PaymentProvider, Routing } from './types';

export type PaymentRegistry = Partial<Record<PaymentMethodValue, PaymentProvider>>;

export class PaymentMethodUnavailableError extends Error {
  constructor(public readonly method: PaymentMethodValue) {
    super(`Payment method "${method}" is not available`);
    this.name = 'PaymentMethodUnavailableError';
  }
}

// Register a future adapter here: one new file plus one line.
const defaultRegistry: PaymentRegistry = {
  cod: codProvider,
};

export const createPaymentFactory = (registry: PaymentRegistry) => {
  const getPaymentProviderByMethod = (method: PaymentMethodValue): PaymentProvider => {
    const provider = Object.hasOwn(registry, method) ? registry[method] : undefined;
    if (!provider) throw new PaymentMethodUnavailableError(method);
    return provider;
  };

  const getPaymentProvider = (routing: Routing): PaymentProvider => {
    if (routing.preferredMethod) return getPaymentProviderByMethod(routing.preferredMethod);
    if (routing.locale === 'vi' && routing.addressCountry === 'VN') {
      return registry.zalopay ?? getPaymentProviderByMethod('momo');
    }
    return getPaymentProviderByMethod('card');
  };

  return { getPaymentProvider, getPaymentProviderByMethod };
};

export const { getPaymentProvider, getPaymentProviderByMethod } =
  createPaymentFactory(defaultRegistry);
