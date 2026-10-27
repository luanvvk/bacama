import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import { AnnouncementForbiddenError } from '@/services/sites/announcement-errors';
import { announcementSchema } from '@/services/sites/announcement-schema';
import { getAdminAnnouncements } from '@/services/sites/get-admin-announcements';
import { createAnnouncement } from '@/services/sites/manage-announcements';

export const GET = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const page = await getAdminAnnouncements(guard.user, {
    cursor: request.nextUrl.searchParams.get('cursor'),
  });

  return NextResponse.json(page);
};

export const POST = async (request: NextRequest) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const announcement = await createAnnouncement(guard.user, parsed.data);
    revalidatePath('/');
    revalidatePath('/story');
    revalidatePath('/sites/[slug]', 'page');
    return NextResponse.json({ id: announcement.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AnnouncementForbiddenError) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    throw error;
  }
};
