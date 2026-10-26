/** @jest-environment node */
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

import { POST } from '../route';

jest.mock('@clerk/nextjs/webhooks', () => ({ verifyWebhook: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: { user: { upsert: jest.fn(), deleteMany: jest.fn() } },
}));

const request = {} as NextRequest;

const userData = (publicMetadata: Record<string, unknown> = {}) => ({
  id: 'clerk_1',
  first_name: 'An',
  last_name: 'Nguyen',
  primary_email_address_id: 'e1',
  email_addresses: [{ id: 'e1', email_address: 'an@example.com' }],
  public_metadata: publicMetadata,
});

const mockEvent = (type: string, data: unknown) =>
  jest.mocked(verifyWebhook).mockResolvedValue({ type, data } as never);

const upsertArgs = () => jest.mocked(prisma.user.upsert).mock.calls[0][0];

beforeEach(() => jest.clearAllMocks());

describe('POST /api/webhooks/clerk', () => {
  it('returns 400 and touches no data when the signature is invalid', async () => {
    jest.mocked(verifyWebhook).mockRejectedValue(new Error('bad signature'));

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.user.deleteMany).not.toHaveBeenCalled();
  });

  it('creates a customer defaulting to vi', async () => {
    mockEvent('user.created', userData());

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(upsertArgs().create).toMatchObject({ role: 'customer', preferredLocale: 'vi' });
  });

  it('takes preferredLocale from public metadata', async () => {
    mockEvent('user.created', userData({ preferredLocale: 'en' }));

    await POST(request);

    expect(upsertArgs().create.preferredLocale).toBe('en');
    expect(upsertArgs().update.preferredLocale).toBe('en');
  });

  it('leaves the stored locale alone on update when invalid', async () => {
    mockEvent('user.updated', userData({ preferredLocale: 'fr' }));

    await POST(request);

    expect(upsertArgs().update).not.toHaveProperty('preferredLocale');
  });

  it('ignores role and homeSiteId from public metadata', async () => {
    mockEvent('user.updated', userData({ role: 'admin', homeSiteId: 'site-1' }));

    await POST(request);

    expect(upsertArgs().create.role).toBe('customer');
    expect(upsertArgs().create).not.toHaveProperty('homeSiteId');
    expect(upsertArgs().update).not.toHaveProperty('role');
    expect(upsertArgs().update).not.toHaveProperty('homeSiteId');
  });

  it('deletes the user by clerkId and returns 200', async () => {
    mockEvent('user.deleted', { id: 'clerk_1', deleted: true });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.user.deleteMany).toHaveBeenCalledWith({ where: { clerkId: 'clerk_1' } });
  });

  it('acknowledges other event types', async () => {
    mockEvent('session.created', {});

    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({ received: true });
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});
