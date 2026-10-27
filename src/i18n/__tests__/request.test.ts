import getConfig from '../request';

const mockGet = jest.fn();

jest.mock('next/headers', () => ({
  cookies: async () => ({ get: mockGet }),
}));
jest.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}));

const run = getConfig as unknown as () => Promise<{ locale: string; messages: unknown }>;

describe('request config locale resolution', () => {
  it.each(['en', 'vi'])('keeps a valid %s cookie', async (value) => {
    mockGet.mockReturnValue({ value });
    expect((await run()).locale).toBe(value);
  });

  it.each(['xx', '', 'en-US'])('falls back to vi for cookie %j', async (value) => {
    mockGet.mockReturnValue({ value });
    const config = await run();
    expect(config.locale).toBe('vi');
    expect(config.messages).toBeDefined();
  });

  it('falls back to vi when the cookie is missing', async () => {
    mockGet.mockReturnValue(undefined);
    expect((await run()).locale).toBe('vi');
  });
});
