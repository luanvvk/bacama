export type AppLocale = 'vi' | 'en';

export const toAppLocale = (locale: string): AppLocale => (locale === 'vi' ? 'vi' : 'en');

/** Vi value for 'vi', falling back to En only when the Vi value is empty. */
export const pickLocalized = <T extends string | null | undefined>(
  locale: AppLocale,
  vi: T,
  en: T,
): T => (locale === 'vi' && vi ? vi : en);
