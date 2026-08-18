const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const daysSince = (date: Date, now = new Date()) =>
  Math.max(0, Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY));

// Beans are sold on freshness, so the label is derived from roastDate on every
// render rather than stored — a stored string goes stale silently (see
// docs/BUILD-PLAN.md §4.3). Items with no roastDate aren't roasted stock.
export const formatFreshness = (roastDate: Date | null | undefined, now = new Date()) => {
  if (!roastDate) return 'Packed to order';

  const days = daysSince(roastDate, now);
  if (days === 0) return 'Roasted today';
  if (days === 1) return 'Roasted yesterday';
  return `Roasted ${days} days ago`;
};
