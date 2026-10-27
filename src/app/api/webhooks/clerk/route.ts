import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

const getUserName = (firstName: string | null, lastName: string | null, email: string) => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email;
};

const getPreferredLocale = (publicMetadata: Record<string, unknown> | undefined) => {
  const locale = publicMetadata?.preferredLocale;
  return locale === 'vi' || locale === 'en' ? locale : undefined;
};

// Holds and active seats count towards `seatsBooked`; the user's Enrollment rows are
// cascade-deleted with the user, so the seats must be freed first. Orders survive (userId SetNull).
const deleteUser = (clerkId: string) =>
  prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { clerkId }, select: { id: true } });
    if (!user) return;

    // Claim the rows by cancelling them, so a concurrent hold release never frees the same seat twice.
    const seats = await tx.enrollment.updateManyAndReturn({
      where: { userId: user.id, status: { in: ['pending', 'active'] }, sessionId: { not: null } },
      data: { status: 'cancelled', holdExpiresAt: null },
      select: { sessionId: true },
    });
    const perSession = new Map<string, number>();
    for (const { sessionId } of seats) {
      if (sessionId) perSession.set(sessionId, (perSession.get(sessionId) ?? 0) + 1);
    }
    for (const [id, n] of perSession) {
      const { count } = await tx.courseSession.updateMany({
        where: { id, seatsBooked: { gte: n } },
        data: { seatsBooked: { decrement: n } },
      });
      if (count === 0)
        await tx.courseSession.updateMany({ where: { id }, data: { seatsBooked: 0 } });
    }

    await tx.user.delete({ where: { id: user.id } });
  });

export const POST = async (request: NextRequest) => {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(request);
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }

  try {
    if (event.type === 'user.deleted') {
      if (event.data.id) await deleteUser(event.data.id);
      return Response.json({ received: true });
    }

    if (event.type !== 'user.created' && event.type !== 'user.updated') {
      return Response.json({ received: true });
    }

    const primaryEmail = event.data.email_addresses.find(
      (email) => email.id === event.data.primary_email_address_id,
    )?.email_address;

    if (!primaryEmail) {
      return Response.json({ error: 'User email is missing' }, { status: 400 });
    }

    const name = getUserName(event.data.first_name, event.data.last_name, primaryEmail);
    const preferredLocale = getPreferredLocale(event.data.public_metadata);

    await prisma.user.upsert({
      where: { clerkId: event.data.id },
      create: {
        clerkId: event.data.id,
        email: primaryEmail,
        name,
        role: 'customer',
        preferredLocale: preferredLocale ?? 'vi',
      },
      update: { email: primaryEmail, name, ...(preferredLocale && { preferredLocale }) },
    });

    return Response.json({ received: true });
  } catch (error) {
    console.error('Clerk webhook failed', {
      svixId: request.headers.get('svix-id'),
      type: event.type,
      error: error instanceof Error ? error.name : 'unknown',
    });
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
};
