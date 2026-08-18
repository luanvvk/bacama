import { daysSince, formatFreshness } from './format-freshness';

const NOW = new Date('2026-08-18T09:00:00.000Z');
const daysBefore = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

describe('daysSince', () => {
  it('counts whole elapsed days', () => {
    expect(daysSince(daysBefore(3), NOW)).toBe(3);
  });

  it('floors a partial day to zero', () => {
    expect(daysSince(new Date('2026-08-18T01:00:00.000Z'), NOW)).toBe(0);
  });

  it('clamps a future date to zero rather than returning a negative count', () => {
    expect(daysSince(daysBefore(-2), NOW)).toBe(0);
  });
});

describe('formatFreshness', () => {
  it('reads as "today" on the roast day', () => {
    expect(formatFreshness(daysBefore(0), NOW)).toBe('Roasted today');
  });

  it('reads as "yesterday" rather than "1 days ago"', () => {
    expect(formatFreshness(daysBefore(1), NOW)).toBe('Roasted yesterday');
  });

  it('counts days beyond that', () => {
    expect(formatFreshness(daysBefore(5), NOW)).toBe('Roasted 5 days ago');
  });

  it('falls back for stock with no roast date', () => {
    expect(formatFreshness(null, NOW)).toBe('Packed to order');
  });
});
