import { NextResponse, type NextRequest } from 'next/server';

import { getAuthProvider } from '@/lib/providers/auth';
import { getAttachmentDownload } from '@/services/courses/get-attachment-download';

const ERROR_STATUS = { not_found: 404, unauthenticated: 401, forbidden: 403 } as const;

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const user = await getAuthProvider().getCurrentUser();
  const result = await getAttachmentDownload(id, user?.id ?? null);

  if (result.status !== 'ok') {
    return NextResponse.json({ error: result.status }, { status: ERROR_STATUS[result.status] });
  }

  // Stored data, but a non-http(s) scheme must never become a redirect target.
  if (!/^https?:\/\//i.test(result.url)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.redirect(result.url, {
    status: 302,
    headers: { 'Cache-Control': 'private, no-store' },
  });
};
