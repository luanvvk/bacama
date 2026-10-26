import { codProvider } from '../cod';

describe('codProvider', () => {
  it('pay resolves a local confirmation with no gateway reference', async () => {
    await expect(
      codProvider.pay(100000, 'ORD1', { locale: 'vi', addressCountry: 'VN' }),
    ).resolves.toEqual({
      provider: 'cod',
      providerRef: 'ORD1',
      redirectUrl: '/checkout/done?ref=ORD1',
    });
  });

  it('parseWebhook throws', () => {
    expect(() => codProvider.parseWebhook(Buffer.from(''), {})).toThrow(/no gateway webhook/);
  });

  it('refund rejects', async () => {
    await expect(codProvider.refund('ORD1', 1, 'x')).rejects.toThrow(/no gateway refund/);
  });
});
