import en from '../../messages/en.json';
import vi from '../../messages/vi.json';

const flatten = (value: unknown, path = ''): Record<string, string> => {
  if (typeof value === 'string') return { [path]: value };
  if (value === null || typeof value !== 'object') return {};
  return Object.entries(value).reduce<Record<string, string>>(
    (acc, [key, child]) => ({ ...acc, ...flatten(child, path ? `${path}.${key}` : key) }),
    {},
  );
};

// Keys whose vi value legitimately matches en: brand/product names, loanwords
// the Vietnamese menu uses as-is, and ids/years/numbering that are not copy.
const ALLOWED_PATTERNS: RegExp[] = [
  /(^|\.)id$/,
  /\.year$/,
  /\.number$/,
  /\.paragraphs\.\d+$/,
  /^PaymentMethod\./,
  /paymentMethods$/,
  /^CookiesPage\.cookieTable\./,
  /^StoryPage\.people\.\d+\.name$/,
  /eyebrow$/i,
  /^WholesalePage\.reachUsLines\./,
  /^(Header\.menu|Nav\.menu|Nav\.latteArt|Nav\.viennoiserie|Menu\.breadcrumbCurrent)$/,
  /^Menu\.sections\.(espresso|chocolate)$/,
  /format(Online)$/,
  /(^|\.)(email|emailLabel)$/,
  /^Admin\.bakery\.handoff_grabfood$/,
];

describe('message files', () => {
  const enFlat = flatten(en);
  const viFlat = flatten(vi);

  it('has the same keys in vi and en', () => {
    expect(Object.keys(viFlat).sort()).toEqual(Object.keys(enFlat).sort());
  });

  it('does not leave vi values identical to en outside the allowlist', () => {
    const untranslated = Object.entries(viFlat)
      .filter(([key, value]) => value !== '' && value === enFlat[key])
      .map(([key]) => key)
      .filter((key) => !ALLOWED_PATTERNS.some((pattern) => pattern.test(key)));

    expect(untranslated).toEqual([]);
  });
});
