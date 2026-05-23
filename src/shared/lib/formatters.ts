const GREEK_LOCALE = "el-GR";
const ATHENS_TIME_ZONE = "Europe/Athens";

const greekLongDateFormatter = new Intl.DateTimeFormat(GREEK_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const greekWeekdayFormatter = new Intl.DateTimeFormat(GREEK_LOCALE, {
  weekday: "long",
});

const athensDateTimeFormatter = new Intl.DateTimeFormat(GREEK_LOCALE, {
  timeZone: ATHENS_TIME_ZONE,
  hour12: false,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const greekNumberFormatter = new Intl.NumberFormat(GREEK_LOCALE);

export function formatGreekLongDate(date: Date): string {
  return greekLongDateFormatter.format(date);
}

export function formatGreekWeekday(date: Date): string {
  return greekWeekdayFormatter.format(date);
}

export function getAthensDateTimeParts(date: Date): Intl.DateTimeFormatPart[] {
  return athensDateTimeFormatter.formatToParts(date);
}

export function formatGreekNumber(value: number): string {
  return greekNumberFormatter.format(value);
}
