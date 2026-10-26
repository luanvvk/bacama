/** @jest-environment node */
jest.mock('@/services/orders/get-order-status', () => ({ getOrderStatus: jest.fn() }));

import type { NextRequest } from 'next/server';

import { getOrderStatus } from '@/services/orders/get-order-status';

import { GET } from '../route';

const mockGetOrderStatus = getOrderStatus as jest.Mock;

const call = (ref: string) => GET({} as NextRequest, { params: Promise.resolve({ ref }) });

describe('GET /api/orders/[ref]/status', () => {
  afterEach(() => mockGetOrderStatus.mockReset());

  it('returns only the status for a known ref', async () => {
    mockGetOrderStatus.mockResolvedValue('pending');

    const response = await call('BCM-ABCD1234');

    expect(mockGetOrderStatus).toHaveBeenCalledWith('BCM-ABCD1234');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'pending' });
  });

  it('returns 404 for an unknown ref', async () => {
    mockGetOrderStatus.mockResolvedValue(null);

    const response = await call('nope');

    expect(response.status).toBe(404);
  });
});
