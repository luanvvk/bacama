// No [locale] route segment exists in this app (see AGENTS.md D6/D9 phase
// order) — locale is resolved from a cookie only, never from the URL. Don't
// wire this into next-intl's `defineRouting`/`createMiddleware`: those assume
// `app/[locale]/...` routing and will rewrite every request to `/<locale>`,
// which 404s here.
export const routing = {
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
} as const;
