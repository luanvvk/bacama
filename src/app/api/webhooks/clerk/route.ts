import { verifyWebhook } from '@clerk/nextjs/webhooks';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

const getUserName = (firstName: string | null, lastName: string | null, email: string) => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email;
};

export const POST = async (request: NextRequest) => {
  try {
    const event = await verifyWebhook(request);

    if (event.type !== 'user.created' && event.type !== 'user.updated') {
      return Response.json({ received: true });
    }

    const primaryEmail = event.data.email_addresses.find(
      (email) => email.id === event.data.primary_email_address_id,
    )?.email_address;

    if (!primaryEmail) {
      return Response.json({ error: 'User email is missing' }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { clerkId: event.data.id },
      create: {
        clerkId: event.data.id,
        email: primaryEmail,
        name: getUserName(event.data.first_name, event.data.last_name, primaryEmail),
        role: 'customer',
      },
      update: {
        email: primaryEmail,
        name: getUserName(event.data.first_name, event.data.last_name, primaryEmail),
      },
    });

    return Response.json({ received: true });
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
};
