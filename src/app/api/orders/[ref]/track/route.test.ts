/** @jest-environment node */
import { NextRequest } from 'next/server';

import { POST } from './route';

jest.mock('@/services/orders/get-order-for-tracking', () => ({
  getOrderForTracking: jest.fn(),
}));

describe('POST /api/orders/[ref]/track', () => {
  it('returns 400 for a malformed JSON body', async () => {
    const res = await POST(
      new NextRequest('http://localhost/api/orders/BCM-1/track', { method: 'POST', body: '{nope' }),
      { params: Promise.resolve({ ref: 'BCM-1' }) },
    );
    expect(res.status).toBe(400);
  });
});
