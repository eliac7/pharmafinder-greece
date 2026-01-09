/**
 * Greek translations for time filter values
 */
export const TIME_TRANSLATIONS: Record<"now" | "today" | "tomorrow", string> =
  {
    now: "τώρα",
    today: "σήμερα",
    tomorrow: "αύριο",
  };

/**
 * Get formatted date string for time filter
 * @param time - Time filter: "now", "today", or "tomorrow"
 * @returns Formatted date string in Greek locale, or null for "now"
 */
export function getDateForTime(
  time?: "now" | "today" | "tomorrow"
): string | null {
  if (!time || time === "now") return null;

  const today = new Date();
  const date =
    time === "tomorrow"
      ? new Date(today.getTime() + 24 * 60 * 60 * 1000)
      : today;

  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
