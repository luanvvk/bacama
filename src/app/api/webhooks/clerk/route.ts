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

export const POST = async (request: NextRequest) => {
  try {
    const event = await verifyWebhook(request);

    if (event.type === 'user.deleted') {
      if (event.data.id) await prisma.user.deleteMany({ where: { clerkId: event.data.id } });
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
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
};
