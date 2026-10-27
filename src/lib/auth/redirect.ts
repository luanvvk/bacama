const FALLBACK = '/me';
const PROBE_ORIGIN = 'http://n';

// Only same-origin paths. Parsing (rather than prefix checks) matters: URL parsers
// strip tab/CR/LF, so "/\t/evil.com" would otherwise become "//evil.com".
export const getSafeRedirectPath = (target: string | string[] | undefined): string => {
  const value = Array.isArray(target) ? target[0] : target;

  if (!value || !value.startsWith('/')) return FALLBACK;

  try {
    const url = new URL(value, PROBE_ORIGIN);

    if (url.origin !== PROBE_ORIGIN || url.pathname.startsWith('//')) return FALLBACK;

    return url.pathname + url.search + url.hash;
  } catch {
    return FALLBACK;
  }
};
