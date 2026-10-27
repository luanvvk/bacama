import { getAnnouncementStatus } from '../announcement-status';

const now = new Date('2026-06-01T12:00:00Z');
const before = new Date('2026-05-01T00:00:00Z');
const after = new Date('2026-07-01T00:00:00Z');

describe('getAnnouncementStatus', () => {
  it('is live inside the window', () => {
    expect(getAnnouncementStatus({ isActive: true, startsAt: before, endsAt: after }, now)).toBe(
      'live',
    );
  });

  it('is live with no end date', () => {
    expect(getAnnouncementStatus({ isActive: true, startsAt: before, endsAt: null }, now)).toBe(
      'live',
    );
  });

  it('is scheduled before it starts', () => {
    expect(getAnnouncementStatus({ isActive: true, startsAt: after, endsAt: null }, now)).toBe(
      'scheduled',
    );
  });

  it('is expired after it ends', () => {
    const endsAt = new Date('2026-05-15T00:00:00Z');

    expect(getAnnouncementStatus({ isActive: true, startsAt: before, endsAt }, now)).toBe(
      'expired',
    );
  });

  it('is live when it starts exactly now', () => {
    expect(getAnnouncementStatus({ isActive: true, startsAt: now, endsAt: null }, now)).toBe(
      'live',
    );
  });

  it('is live when it ends exactly now', () => {
    expect(getAnnouncementStatus({ isActive: true, startsAt: before, endsAt: now }, now)).toBe(
      'live',
    );
  });

  it('is draft when inactive regardless of dates', () => {
    expect(getAnnouncementStatus({ isActive: false, startsAt: before, endsAt: after }, now)).toBe(
      'draft',
    );
    expect(getAnnouncementStatus({ isActive: false, startsAt: after, endsAt: null }, now)).toBe(
      'draft',
    );
  });

  it('accepts ISO strings', () => {
    const window = {
      isActive: true,
      startsAt: before.toISOString(),
      endsAt: after.toISOString(),
    };

    expect(getAnnouncementStatus(window, now)).toBe('live');
  });
});
