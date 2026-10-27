/** @jest-environment node */
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

import { POST } from '../route';

jest.mock('@clerk/nextjs/webhooks', () => ({ verifyWebhook: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { upsert: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    enrollment: { updateManyAndReturn: jest.fn() },
    courseSession: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

const request = { headers: new Headers({ 'svix-id': 'msg_1' }) } as unknown as NextRequest;

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

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(prisma.$transaction)
    .mockImplementation(((fn: (tx: unknown) => unknown) => fn(prisma)) as never);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('POST /api/webhooks/clerk', () => {
  it('returns 400 and touches no data when the signature is invalid', async () => {
    jest.mocked(verifyWebhook).mockRejectedValue(new Error('bad signature'));

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prisma.user.upsert).not.toHaveBeenCalled();
    expect(prisma.user.delete).not.toHaveBeenCalled();
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

  it('frees held and active seats, then deletes the user', async () => {
    mockEvent('user.deleted', { id: 'clerk_1', deleted: true });
    jest.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as never);
    jest
      .mocked(prisma.enrollment.updateManyAndReturn)
      .mockResolvedValue([{ sessionId: 's1' }, { sessionId: 's1' }, { sessionId: 's2' }] as never);
    jest.mocked(prisma.courseSession.updateMany).mockResolvedValue({ count: 1 } as never);

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.courseSession.updateMany).toHaveBeenCalledWith({
      where: { id: 's1', seatsBooked: { gte: 2 } },
      data: { seatsBooked: { decrement: 2 } },
    });
    expect(prisma.courseSession.updateMany).toHaveBeenCalledWith({
      where: { id: 's2', seatsBooked: { gte: 1 } },
      data: { seatsBooked: { decrement: 1 } },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('acknowledges deletion of an unknown user', async () => {
    mockEvent('user.deleted', { id: 'clerk_x', deleted: true });
    jest.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('returns 500 and logs no personal data when the database fails', async () => {
    mockEvent('user.updated', userData());
    jest
      .mocked(prisma.user.upsert)
      .mockRejectedValue(new Error('Unique constraint on an@example.com'));

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(console.error).toHaveBeenCalledWith(
      'Clerk webhook failed',
      expect.objectContaining({ svixId: 'msg_1', type: 'user.updated' }),
    );
    expect(JSON.stringify(jest.mocked(console.error).mock.calls)).not.toContain('an@example.com');
  });

  it('acknowledges other event types', async () => {
    mockEvent('session.created', {});

    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({ received: true });
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });
});
