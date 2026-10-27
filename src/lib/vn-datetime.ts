// Vietnam is a fixed UTC+7 with no DST, so a datetime-local value maps to an instant by suffix.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/** `YYYY-MM-DDTHH:mm` (datetime-local value, Vietnam wall clock) → ISO string with offset. */
export const toVietnamIso = (local: string): string => `${local}:00+07:00`;

export const toVietnamLocalInput = (date: Date | string): string =>
  new Date(new Date(date).getTime() + VN_OFFSET_MS).toISOString().slice(0, 16);
