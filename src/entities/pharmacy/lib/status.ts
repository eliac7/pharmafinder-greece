import {
  type PharmacyHour,
  type PharmacyStatusResult,
  type TimeFilter,
} from "../model/types";
import { getAthensDateTimeParts } from "@/shared/lib/formatters";

export interface DutySummaryLike {
  data_status: "fresh" | "partial" | "stale" | "unknown";
  periods: Array<{
    opens_at: string;
    closes_at: string;
    date?: string | null;
  }>;
}

export function dutyPeriodsToPharmacyHours(
  periods: DutySummaryLike["periods"],
): PharmacyHour[] {
  return periods.map((period) => ({
    open_time: period.opens_at,
    close_time: period.closes_at,
    date: period.date ?? null,
  }));
}

/**
 * Format pharmacy hours for display
 * @param hours - Array of operating hour slots
 * @returns Formatted string like "00:00 - 08:00" or null if no hours.
 * Slots that run past midnight (close 23:59, next opens 00:00) are merged
 * into a single range annotated with "(επόμενης)".
 */
export function formatPharmacyHours(hours: PharmacyHour[]): string | null {
  if (!hours || hours.length === 0) return null;

  type Part = { text: string; openTime: string; closeTime: string; date: string | null };
  const parts: Part[] = [];

  for (const slot of hours) {
    if (!slot.open_time || !slot.close_time) continue;
    // Remove seconds from time format (HH:MM:SS -> HH:MM)
    const openTime = slot.open_time.slice(0, 5);
    const closeTime = slot.close_time.slice(0, 5);

    const previous = parts[parts.length - 1];
    const continuesOvernight =
      previous !== undefined &&
      previous.closeTime === "23:59" &&
      openTime === "00:00" &&
      (previous.date == null ||
        slot.date == null ||
        isNextDay(previous.date, slot.date));

    if (continuesOvernight) {
      previous.text = `${previous.openTime} - ${closeTime} (επόμενης)`;
      previous.closeTime = closeTime;
      previous.date = slot.date;
    } else {
      parts.push({ text: `${openTime} - ${closeTime}`, openTime, closeTime, date: slot.date });
    }
  }

  if (parts.length === 0) return null;
  return parts.map((part) => part.text).join(", ");
}

function isNextDay(previousDate: string, nextDate: string): boolean {
  const previous = new Date(`${previousDate}T00:00:00Z`);
  const next = new Date(`${nextDate}T00:00:00Z`);
  if (Number.isNaN(previous.getTime()) || Number.isNaN(next.getTime())) {
    return false;
  }
  return next.getTime() - previous.getTime() === 24 * 60 * 60 * 1000;
}

/**
 * Calculate the current status of a pharmacy based on its operating hours
 * @param hours - Array of operating hour slots
 * @param openUntilTomorrow - Whether the pharmacy stays open past midnight
 * @param nextDayCloseTime - The closing time on the next day if open overnight
 * @param timeFilter - The currently selected time filter ("now", "today", "tomorrow")
 * @returns Status information including whether it's open, closing soon, scheduled, or closed
 */
/**
 * Calculate the current status of a pharmacy based on its operating hours
 * @param hours - Array of operating hour slots
 * @param openUntilTomorrow - Whether the pharmacy stays open past midnight
 * @param nextDayCloseTime - The closing time on the next day if open overnight
 * @param timeFilter - The currently selected time filter ("now", "today", "tomorrow")
 * @returns Status information including whether it's open, closing soon, scheduled, or closed
 */
export function getPharmacyStatus(
  hours: PharmacyHour[],
  openUntilTomorrow: boolean | null,
  nextDayCloseTime: string | null,
  timeFilter: TimeFilter = "now",
): PharmacyStatusResult {
  const CLOSED_COLOR = "bg-muted text-muted-foreground border border-border";
  const OPEN_COLOR =
    "bg-emerald-500/15 text-emerald-700 dark:bg-primary/15 dark:text-primary";
  const CLOSING_SOON_COLOR = "bg-amber-500/15 text-amber-600";
  const SCHEDULED_COLOR =
    "bg-emerald-500/15 text-emerald-700 dark:bg-primary/15 dark:text-primary";

  if (!hours || hours.length === 0) {
    return {
      status: "closed",
      statusColor: CLOSED_COLOR,
      closingTime: null,
      minutesUntilClose: null,
    };
  }

  // For "today" and "tomorrow" filters, we show ALL pharmacies scheduled for that day
  // without checking if they're currently open or closed
  if (timeFilter === "today" || timeFilter === "tomorrow") {
    return {
      status: "scheduled",
      statusColor: SCHEDULED_COLOR,
      closingTime: null,
      minutesUntilClose: null,
    };
  }

  // For "now" filter, check real-time status
  const now = new Date();

  const parts = getAthensDateTimeParts(now);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || "";

  const currentYear = getPart("year");
  const currentMonth = getPart("month");
  const currentDay = getPart("day");
  const currentDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

  const currentHour = parseInt(getPart("hour"), 10);
  const currentMinute = parseInt(getPart("minute"), 10);
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // Check if currently within any open time slot
  for (const slot of hours) {
    if (!slot.open_time || !slot.close_time) continue;

    // If slot has a date, ensure it matches today's Greek date
    // This prevents matching tomorrow's early morning slots (e.g., 00:00-08:00) against today's time
    if (slot.date && slot.date !== currentDateStr) {
      continue;
    }

    const [openHour, openMinute] = slot.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = slot.close_time.split(":").map(Number);

    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;

    // Detect overnight shift (crosses midnight)
    // E.g. Open 17:00, Close 08:00
    const isOvernight = closeTotalMinutes < openTotalMinutes;

    if (isOvernight) {
      // Overnight Logic: Open [17:00] -- Midnight -- Close [08:00]

      if (
        currentTotalMinutes >= openTotalMinutes ||
        currentTotalMinutes < closeTotalMinutes
      ) {
        let minutesUntilClose = 0;
        if (currentTotalMinutes >= openTotalMinutes) {
          minutesUntilClose = closeTotalMinutes + 24 * 60 - currentTotalMinutes;
        } else {
          minutesUntilClose = closeTotalMinutes - currentTotalMinutes;
        }

        if (minutesUntilClose <= 30) {
          return {
            status: "closing-soon",
            statusColor: CLOSING_SOON_COLOR,
            closingTime: slot.close_time,
            minutesUntilClose,
          };
        }
        return {
          status: "open",
          statusColor: OPEN_COLOR,
          closingTime: slot.close_time,
          minutesUntilClose,
        };
      }
    } else {
      if (
        currentTotalMinutes >= openTotalMinutes &&
        currentTotalMinutes < closeTotalMinutes
      ) {
        const minutesUntilClose = closeTotalMinutes - currentTotalMinutes;
        if (minutesUntilClose <= 30) {
          return {
            status: "closing-soon",
            statusColor: CLOSING_SOON_COLOR,
            closingTime: slot.close_time,
            minutesUntilClose,
          };
        }
        return {
          status: "open",
          statusColor: OPEN_COLOR,
          closingTime: slot.close_time,
          minutesUntilClose,
        };
      }
    }
  }

  // Not within any time slot = closed
  return {
    status: "closed",
    statusColor: CLOSED_COLOR,
    closingTime: null,
    minutesUntilClose: null,
  };
}

/** Convert a bounded v1 duty summary into the existing status presentation. */
export function getDutySummaryStatus(
  summary: DutySummaryLike | null | undefined,
  timeFilter: TimeFilter = "now",
): PharmacyStatusResult {
  if (
    !summary ||
    (summary.data_status !== "fresh" && summary.data_status !== "partial")
  ) {
    return getPharmacyStatus([], null, null, timeFilter);
  }

  return getPharmacyStatus(
    dutyPeriodsToPharmacyHours(summary.periods),
    null,
    null,
    timeFilter,
  );
}
