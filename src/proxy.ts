import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const COOKIE_NAME = 'NEXT_LOCALE';

// Vietnamese is the default for every first-time visitor, browser language
// notwithstanding (AGENTS.md D6) — English is opt-in only, via the toggle.
// This just persists that default as a cookie so it's stable across requests
// until the visitor switches it themselves.
export default function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_NAME)) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, routing.defaultLocale, { path: '/', sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
