import {
  type PharmacyHour,
  type PharmacyStatusResult,
  type TimeFilter,
} from "../model/types";

/**
 * Format pharmacy hours for display
 * @param hours - Array of operating hour slots
 * @returns Formatted string like "00:00 - 08:00" or null if no hours
 */
export function formatPharmacyHours(hours: PharmacyHour[]): string | null {
  if (!hours || hours.length === 0) return null;

  return hours
    .map((slot) => {
      if (!slot.open_time || !slot.close_time) return null;
      // Remove seconds from time format (HH:MM:SS -> HH:MM)
      const openTime = slot.open_time.slice(0, 5);
      const closeTime = slot.close_time.slice(0, 5);
      return `${openTime} - ${closeTime}`;
    })
    .filter(Boolean)
    .join(", ");
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
  timeFilter: TimeFilter = "now"
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
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  // Check if currently within any open time slot
  for (const slot of hours) {
    if (!slot.open_time || !slot.close_time) continue;

    const [openHour, openMinute] = slot.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = slot.close_time.split(":").map(Number);

    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;

    // Detect overnight shift (crosses midnight)
    // E.g. Open 17:00, Close 08:00
    let isOvernight = closeTotalMinutes < openTotalMinutes;

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
