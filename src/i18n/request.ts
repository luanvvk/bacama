import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

type Locale = (typeof routing.locales)[number];

const isLocale = (value: string | undefined): value is Locale =>
  routing.locales.some((locale) => locale === value);

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isLocale(raw) ? raw : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
