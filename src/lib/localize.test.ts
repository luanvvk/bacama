import { pickLocalized, toAppLocale } from './localize';

describe('pickLocalized', () => {
  it('returns the Vi value for vi', () => {
    expect(pickLocalized('vi', 'Cà phê', 'Coffee')).toBe('Cà phê');
  });

  it('returns the En value for en', () => {
    expect(pickLocalized('en', 'Cà phê', 'Coffee')).toBe('Coffee');
  });

  it('falls back to En when the Vi value is empty or null', () => {
    expect(pickLocalized('vi', '', 'Coffee')).toBe('Coffee');
    expect(pickLocalized('vi', null, 'Coffee')).toBe('Coffee');
  });
});

describe('toAppLocale', () => {
  it('maps anything but vi to en', () => {
    expect(toAppLocale('vi')).toBe('vi');
    expect(toAppLocale('fr')).toBe('en');
  });
});
