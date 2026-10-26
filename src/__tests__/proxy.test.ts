/** @jest-environment node */
import { NextRequest } from 'next/server';

import proxy from '../proxy';

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: unknown) => handler,
}));

const run = (cookie?: string) => {
  const request = new NextRequest('http://localhost/', {
    headers: cookie ? { cookie } : undefined,
  });
  return (proxy as unknown as (auth: unknown, request: NextRequest) => Response)(null, request);
};

describe('proxy', () => {
  it('sets NEXT_LOCALE=vi when the cookie is absent', () => {
    expect(run().headers.get('set-cookie')).toContain('NEXT_LOCALE=vi');
  });

  it('does not overwrite an existing NEXT_LOCALE cookie', () => {
    expect(run('NEXT_LOCALE=en').headers.get('set-cookie')).toBeNull();
  });
});
