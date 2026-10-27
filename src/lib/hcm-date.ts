const HCM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const HCM_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: HCM_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const toHcmDateString = (date: Date | null | undefined) =>
  date ? HCM_DATE_FORMATTER.format(date) : '';

export const startOfHcmDay = (dateString: string) => new Date(`${dateString}T00:00:00+07:00`);

export const endOfHcmDay = (dateString: string) => new Date(`${dateString}T23:59:59+07:00`);
