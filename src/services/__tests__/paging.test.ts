import { clampTake, pageArgs, toPage } from '../paging';

const rows = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `r${i + 1}` }));

describe('clampTake', () => {
  it('defaults to 50 and clamps to 100', () => {
    expect(clampTake()).toBe(50);
    expect(clampTake(10)).toBe(10);
    expect(clampTake(500)).toBe(100);
  });

  it('falls back to the default for non-positive or non-integer values', () => {
    expect(clampTake(0)).toBe(50);
    expect(clampTake(-3)).toBe(50);
    expect(clampTake(2.5)).toBe(50);
    expect(clampTake(Number.NaN)).toBe(50);
  });
});

describe('pageArgs', () => {
  it('fetches one extra row and no cursor on the first page', () => {
    expect(pageArgs()).toEqual({ take: 51 });
  });

  it('skips the cursor row on later pages', () => {
    expect(pageArgs({ take: 10, cursor: 'r10' })).toEqual({
      take: 11,
      cursor: { id: 'r10' },
      skip: 1,
    });
  });

  it('treats an empty cursor as the first page', () => {
    expect(pageArgs({ cursor: '' })).toEqual({ take: 51 });
  });

  it('clamps take', () => {
    expect(pageArgs({ take: 1000 }).take).toBe(101);
  });
});

describe('toPage', () => {
  it('returns a cursor on a first or middle page', () => {
    const page = toPage(rows(4), { take: 3 });

    expect(page.items.map((r) => r.id)).toEqual(['r1', 'r2', 'r3']);
    expect(page.nextCursor).toBe('r3');
  });

  it('has no cursor on the last page', () => {
    expect(toPage(rows(3), { take: 3 })).toEqual({ items: rows(3), nextCursor: null });
    expect(toPage(rows(2), { take: 3 }).nextCursor).toBeNull();
  });

  it('handles an empty result (e.g. a cursor that no longer exists)', () => {
    expect(toPage([])).toEqual({ items: [], nextCursor: null });
  });

  it('applies the take clamp', () => {
    expect(toPage(rows(101)).items).toHaveLength(50);
    expect(toPage(rows(101), { take: 500 }).nextCursor).toBe('r100');
  });
});
