'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';

const LOCALES = ['vi', 'en'] as const;

const setLocaleCookie = (next: (typeof LOCALES)[number]) => {
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
};

export const LocaleToggle = () => {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: (typeof LOCALES)[number]) => {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex items-center gap-1 font-mono text-xs uppercase">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          disabled={isPending}
          aria-pressed={locale === code}
          className={cn(
            'rounded px-1.5 py-1 transition-colors',
            locale === code
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
};
