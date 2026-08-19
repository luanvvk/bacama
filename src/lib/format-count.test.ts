import { countWord, formatCafeCount, pluralize } from './format-count';

describe('countWord', () => {
  it('spells out small counts', () => {
    expect(countWord(0)).toBe('No');
    expect(countWord(2)).toBe('Two');
  });

  it('falls back to the numeral past the spelled-out range', () => {
    expect(countWord(9)).toBe('9');
  });
});

describe('pluralize', () => {
  it('keeps the singular for exactly one', () => {
    expect(pluralize(1, 'seat')).toBe('seat');
    expect(pluralize(2, 'seat')).toBe('seats');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(2, 'person', 'people')).toBe('people');
  });
});

describe('formatCafeCount', () => {
  it('agrees in number with the count', () => {
    expect(formatCafeCount(1)).toBe('One café');
    expect(formatCafeCount(2)).toBe('Two cafés');
  });
});
