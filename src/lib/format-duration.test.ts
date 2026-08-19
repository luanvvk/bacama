import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('formats under an hour as m:ss', () => {
    expect(formatDuration(760)).toBe('12:40');
    expect(formatDuration(558)).toBe('9:18');
  });

  it('formats an hour or more as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('returns null when there is no video to time', () => {
    expect(formatDuration(null)).toBeNull();
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(0)).toBeNull();
  });
});
