import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { requireApiRole } from '@/lib/auth/api-guards';
import {
  AnnouncementForbiddenError,
  AnnouncementNotFoundError,
} from '@/services/sites/announcement-errors';
import { announcementSchema } from '@/services/sites/announcement-schema';
import { deleteAnnouncement, updateAnnouncement } from '@/services/sites/manage-announcements';

type RouteContext = { params: Promise<{ id: string }> };

const revalidateAnnouncements = () => {
  revalidatePath('/');
  revalidatePath('/story');
  revalidatePath('/sites/[slug]', 'page');
};

const errorResponse = (error: unknown) => {
  if (error instanceof AnnouncementForbiddenError) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (error instanceof AnnouncementNotFoundError) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  throw error;
};

export const PATCH = async (request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const announcement = await updateAnnouncement(guard.user, id, parsed.data);
    revalidateAnnouncements();
    return NextResponse.json({ id: announcement.id });
  } catch (error) {
    return errorResponse(error);
  }
};

export const DELETE = async (_request: NextRequest, { params }: RouteContext) => {
  const guard = await requireApiRole(['staff', 'admin']);
  if (!guard.ok) return guard.response;

  try {
    const { id } = await params;
    const announcement = await deleteAnnouncement(guard.user, id);
    revalidateAnnouncements();
    return NextResponse.json({ id: announcement.id });
  } catch (error) {
    return errorResponse(error);
  }
};
