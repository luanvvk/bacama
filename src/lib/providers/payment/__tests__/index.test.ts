import { createPaymentFactory, PaymentMethodUnavailableError, getPaymentProvider } from '../index';
import { codProvider } from '../cod';
import type { PaymentProvider } from '../types';

const stub = (): PaymentProvider => ({
  pay: jest.fn(),
  parseWebhook: jest.fn(),
  refund: jest.fn(),
});

describe('payment factory routing', () => {
  const zalopay = stub();
  const momo = stub();
  const card = stub();
  const full = createPaymentFactory({ cod: codProvider, zalopay, momo, card });

  it('vi + VN uses zalopay', () => {
    expect(full.getPaymentProvider({ locale: 'vi', addressCountry: 'VN' })).toBe(zalopay);
  });

  it('vi + VN falls to momo when zalopay is not registered', () => {
    const f = createPaymentFactory({ momo });
    expect(f.getPaymentProvider({ locale: 'vi', addressCountry: 'VN' })).toBe(momo);
  });

  it('en + VN uses card', () => {
    expect(full.getPaymentProvider({ locale: 'en', addressCountry: 'VN' })).toBe(card);
  });

  it('vi + non-VN uses card', () => {
    expect(full.getPaymentProvider({ locale: 'vi', addressCountry: 'US' })).toBe(card);
  });

  it('preferred cod is honoured', () => {
    expect(
      full.getPaymentProvider({ locale: 'en', addressCountry: 'US', preferredMethod: 'cod' }),
    ).toBe(codProvider);
  });

  it('unregistered preferred method throws and is not swapped', () => {
    const f = createPaymentFactory({ zalopay, card });
    expect.assertions(2);
    try {
      f.getPaymentProvider({ locale: 'vi', addressCountry: 'VN', preferredMethod: 'momo' });
    } catch (e) {
      expect(e).toBeInstanceOf(PaymentMethodUnavailableError);
      expect((e as PaymentMethodUnavailableError).method).toBe('momo');
    }
  });

  it('default route with nothing registered throws', () => {
    expect(() => getPaymentProvider({ locale: 'vi', addressCountry: 'VN' })).toThrow(
      PaymentMethodUnavailableError,
    );
  });

  it('getPaymentProviderByMethod returns or throws', () => {
    expect(full.getPaymentProviderByMethod('cod')).toBe(codProvider);
    expect(() => full.getPaymentProviderByMethod('vnpay_qr')).toThrow(
      PaymentMethodUnavailableError,
    );
  });
});

describe('getAvailablePaymentMethods', () => {
  it('lists only registered methods', () => {
    const f = createPaymentFactory({ cod: codProvider, momo: stub() });
    expect(f.getAvailablePaymentMethods()).toEqual(['cod', 'momo']);
  });

  it('is empty when nothing is registered', () => {
    expect(createPaymentFactory({}).getAvailablePaymentMethods()).toEqual([]);
  });
});
