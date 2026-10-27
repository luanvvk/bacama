import { toVietnamIso, toVietnamLocalInput } from './vn-datetime';

describe('vn-datetime', () => {
  it('appends the +07:00 offset', () => {
    expect(toVietnamIso('2026-06-01T09:30')).toBe('2026-06-01T09:30:00+07:00');
  });

  it('maps Vietnam midnight to 17:00Z on the previous day', () => {
    expect(new Date(toVietnamIso('2026-06-01T00:00')).toISOString()).toBe(
      '2026-05-31T17:00:00.000Z',
    );
  });

  it('round-trips a local input value', () => {
    const local = '2026-12-31T23:45';

    expect(toVietnamLocalInput(new Date(toVietnamIso(local)))).toBe(local);
  });

  it('formats a Date and an ISO string the same way', () => {
    expect(toVietnamLocalInput('2026-05-31T17:00:00Z')).toBe('2026-06-01T00:00');
    expect(toVietnamLocalInput(new Date('2026-05-31T17:00:00Z'))).toBe('2026-06-01T00:00');
  });
});
