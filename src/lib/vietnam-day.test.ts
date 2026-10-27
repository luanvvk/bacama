import { getVietnamDayRange } from './vietnam-day';

describe('getVietnamDayRange', () => {
  it('starts the day at 00:00 UTC+7', () => {
    const { start, end, yesterdayStart } = getVietnamDayRange(new Date('2026-08-13T05:00:00Z'));

    expect(start.toISOString()).toBe('2026-08-12T17:00:00.000Z');
    expect(end.toISOString()).toBe('2026-08-13T17:00:00.000Z');
    expect(yesterdayStart.toISOString()).toBe('2026-08-11T17:00:00.000Z');
  });

  it('treats 17:00 UTC as already the next local day', () => {
    const { start } = getVietnamDayRange(new Date('2026-08-12T17:00:00Z'));

    expect(start.toISOString()).toBe('2026-08-12T17:00:00.000Z');
  });

  it('treats 16:59 UTC as still the same local day', () => {
    const { start } = getVietnamDayRange(new Date('2026-08-12T16:59:59Z'));

    expect(start.toISOString()).toBe('2026-08-11T17:00:00.000Z');
  });
});
