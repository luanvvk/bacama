const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface VietnamDayRange {
  start: Date;
  end: Date;
  yesterdayStart: Date;
}

/** Local-midnight boundaries for `now` in Asia/Ho_Chi_Minh (UTC+7, no DST). */
export const getVietnamDayRange = (now: Date): VietnamDayRange => {
  const localMs = now.getTime() + VIETNAM_OFFSET_MS;
  const startMs = Math.floor(localMs / DAY_MS) * DAY_MS - VIETNAM_OFFSET_MS;

  return {
    start: new Date(startMs),
    end: new Date(startMs + DAY_MS),
    yesterdayStart: new Date(startMs - DAY_MS),
  };
};
